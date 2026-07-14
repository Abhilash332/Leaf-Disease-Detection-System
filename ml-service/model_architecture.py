import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models

# Constants from training configuration
IMAGE_SIZE  = 224
PATCH_SIZE  = 14
EMBED_DIM   = 8
WINDOW_SIZE = 4
NUM_HEADS   = [1, 2, 4, 8]
DEPTHS      = [2, 2, 2, 2]
MLP_RATIO   = 2.0
DROP_RATE   = 0.1

def _make_divisible(v, divisor, min_value=None):
    if min_value is None:
        min_value = divisor
    new_v = max(min_value, int(v + divisor / 2) // divisor * divisor)
    if new_v < 0.9 * v:
        new_v += divisor
    return new_v

class SEBlock(nn.Module):
    def __init__(self, in_channels, ratio=4):
        super(SEBlock, self).__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Conv2d(in_channels, in_channels // ratio, 1, bias=True),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels // ratio, in_channels, 1, bias=True),
            nn.Sigmoid()
        )
    def forward(self, x):
        return x * self.fc(self.avg_pool(x))

def window_partition(x, window_size):
    B, H, W, C = x.shape
    x = x.view(B, H // window_size, window_size, W // window_size, window_size, C)
    windows = x.permute(0, 1, 3, 2, 4, 5).contiguous().view(-1, window_size, window_size, C)
    return windows

def window_reverse(windows, window_size, H, W):
    B = int(windows.shape[0] / (H * W / window_size / window_size))
    x = windows.view(B, H // window_size, W // window_size, window_size, window_size, -1)
    x = x.permute(0, 1, 3, 2, 4, 5).contiguous().view(B, H, W, -1)
    return x

def compute_mask(H, W, window_size, shift_size, device):
    img_mask = torch.zeros((1, H, W, 1), device=device)
    h_slices = (slice(0, -window_size), slice(-window_size, -shift_size), slice(-shift_size, None))
    w_slices = (slice(0, -window_size), slice(-window_size, -shift_size), slice(-shift_size, None))
    cnt = 0
    for h in h_slices:
        for w in w_slices:
            img_mask[:, h, w, :] = cnt
            cnt += 1
    mask_windows = window_partition(img_mask, window_size)
    mask_windows = mask_windows.view(-1, window_size * window_size)
    attn_mask = mask_windows.unsqueeze(1) - mask_windows.unsqueeze(2)
    attn_mask = attn_mask.masked_fill(attn_mask != 0, float(-100.0)).masked_fill(attn_mask == 0, float(0.0))
    return attn_mask

class WindowAttention(nn.Module):
    def __init__(self, dim, window_size, num_heads, qkv_bias=True, attn_drop=0., proj_drop=0.):
        super().__init__()
        self.dim = dim
        self.window_size = window_size
        self.num_heads = num_heads
        head_dim = dim // num_heads
        self.scale = head_dim ** -0.5

        self.relative_position_bias_table = nn.Parameter(
            torch.zeros((2 * window_size[0] - 1) * (2 * window_size[1] - 1), num_heads)
        )

        coords_h = torch.arange(self.window_size[0])
        coords_w = torch.arange(self.window_size[1])
        coords = torch.stack(torch.meshgrid([coords_h, coords_w], indexing='ij'))
        coords_flatten = torch.flatten(coords, 1)
        relative_coords = coords_flatten[:, :, None] - coords_flatten[:, None, :]
        relative_coords = relative_coords.permute(1, 2, 0).contiguous()
        relative_coords[:, :, 0] += self.window_size[0] - 1
        relative_coords[:, :, 1] += self.window_size[1] - 1
        relative_coords[:, :, 0] *= 2 * self.window_size[1] - 1
        relative_position_index = relative_coords.sum(-1)
        self.register_buffer('relative_position_index', relative_position_index)

        self.qkv = nn.Linear(dim, dim * 3, bias=qkv_bias)
        self.attn_drop = nn.Dropout(attn_drop)
        self.proj = nn.Linear(dim, dim)
        self.proj_drop = nn.Dropout(proj_drop)
        nn.init.trunc_normal_(self.relative_position_bias_table, std=.02)

    def forward(self, x, mask=None):
        B_, N, C = x.shape
        qkv = self.qkv(x).reshape(B_, N, 3, self.num_heads, C // self.num_heads).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        q = q * self.scale
        attn = (q @ k.transpose(-2, -1))

        rel_pos_bias = self.relative_position_bias_table[self.relative_position_index.view(-1)].view(
            self.window_size[0] * self.window_size[1], self.window_size[0] * self.window_size[1], -1
        )
        rel_pos_bias = rel_pos_bias.permute(2, 0, 1).contiguous()
        attn = attn + rel_pos_bias.unsqueeze(0)

        if mask is not None:
            nW = mask.shape[0]
            attn = attn.view(B_ // nW, nW, self.num_heads, N, N) + mask.unsqueeze(1).unsqueeze(0)
            attn = attn.view(-1, self.num_heads, N, N)
            attn = F.softmax(attn, dim=-1)
        else:
            attn = F.softmax(attn, dim=-1)

        attn = self.attn_drop(attn)
        x = (attn @ v).transpose(1, 2).reshape(B_, N, C)
        x = self.proj(x)
        x = self.proj_drop(x)
        return x

class SwinTransformerBlock(nn.Module):
    def __init__(self, dim, num_heads, window_size=7, shift_size=0,
                 mlp_ratio=2., qkv_bias=True, dropout=0.1):
        super().__init__()
        self.dim = dim
        self.num_heads = num_heads
        self.window_size = window_size
        self.shift_size = shift_size

        self.norm1 = nn.LayerNorm(dim)
        self.attn = WindowAttention(
            dim, window_size=(window_size, window_size), num_heads=num_heads,
            qkv_bias=qkv_bias, attn_drop=dropout, proj_drop=dropout
        )

        self.norm2 = nn.LayerNorm(dim)
        self.mlp = nn.Sequential(
            nn.Linear(dim, int(dim * mlp_ratio)),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(int(dim * mlp_ratio), dim),
            nn.Dropout(dropout)
        )

    def forward(self, x):
        H, W = self.H, self.W
        B, L, C = x.shape
        shortcut = x
        x = self.norm1(x)
        x = x.view(B, H, W, C)

        if self.shift_size > 0 and H > self.window_size and W > self.window_size:
            shifted_x = torch.roll(x, shifts=(-self.shift_size, -self.shift_size), dims=(1, 2))
            attn_mask = compute_mask(H, W, self.window_size, self.shift_size, x.device)
        else:
            shifted_x = x
            attn_mask = None

        x_windows = window_partition(shifted_x, self.window_size)
        x_windows = x_windows.view(-1, self.window_size * self.window_size, C)
        attn_windows = self.attn(x_windows, mask=attn_mask)
        attn_windows = attn_windows.view(-1, self.window_size, self.window_size, C)
        shifted_x = window_reverse(attn_windows, self.window_size, H, W)

        if self.shift_size > 0 and H > self.window_size and W > self.window_size:
            x = torch.roll(shifted_x, shifts=(self.shift_size, self.shift_size), dims=(1, 2))
        else:
            x = shifted_x

        x = x.view(B, H * W, C)
        x = shortcut + x
        x = x + self.mlp(self.norm2(x))
        return x

class PatchMerging(nn.Module):
    def __init__(self, input_resolution, dim):
        super().__init__()
        self.input_resolution = input_resolution
        self.dim = dim
        self.reduction = nn.Linear(4 * dim, 2 * dim, bias=False)
        self.norm = nn.LayerNorm(4 * dim)

    def forward(self, x):
        H, W = self.input_resolution
        B, L, C = x.shape
        x = x.view(B, H, W, C)
        x0 = x[:, 0::2, 0::2, :]
        x1 = x[:, 1::2, 0::2, :]
        x2 = x[:, 0::2, 1::2, :]
        x3 = x[:, 1::2, 1::2, :]
        x = torch.cat([x0, x1, x2, x3], -1).view(B, -1, 4 * C)
        x = self.norm(x)
        return self.reduction(x)

class PatchEmbed(nn.Module):
    def __init__(self, img_size=224, patch_size=14, in_chans=3, embed_dim=8):
        super().__init__()
        self.patches_resolution = [img_size // patch_size, img_size // patch_size]
        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x):
        x = self.proj(x).flatten(2).transpose(1, 2)
        return self.norm(x)

class SwinStage(nn.Module):
    def __init__(self, dim, depth, num_heads, window_size, input_resolution,
                 mlp_ratio=2., downsample=None):
        super().__init__()
        effective_ws = min(window_size, input_resolution[0], input_resolution[1])
        self.blocks = nn.ModuleList([
            SwinTransformerBlock(
                dim=dim, num_heads=num_heads, window_size=effective_ws,
                shift_size=0 if (i % 2 == 0) else effective_ws // 2,
                mlp_ratio=mlp_ratio
            ) for i in range(depth)
        ])
        self.downsample = downsample(input_resolution, dim=dim) if downsample is not None else None

    def forward(self, x, H, W):
        for block in self.blocks:
            block.H, block.W = H, W
            x = block(x)
        if self.downsample is not None:
            x = self.downsample(x)
            H, W = H // 2, W // 2
        return x, H, W

class CustomSwinTBranch(nn.Module):
    def __init__(self, img_size=IMAGE_SIZE, patch_size=PATCH_SIZE, in_chans=3,
                 embed_dim=EMBED_DIM, depths=DEPTHS, num_heads=NUM_HEADS,
                 window_size=WINDOW_SIZE, mlp_ratio=MLP_RATIO):
        super().__init__()
        self.patch_embed = PatchEmbed(
            img_size=img_size, patch_size=patch_size,
            in_chans=in_chans, embed_dim=embed_dim
        )
        H, W = self.patch_embed.patches_resolution
        self.patches_resolution = [H, W]

        self.stages = nn.ModuleList()
        for i in range(len(depths)):
            stage_res = (H // (2 ** i), W // (2 ** i))
            stage_dim = embed_dim * (2 ** i)
            downsample = PatchMerging if (i < len(depths) - 1) else None
            self.stages.append(SwinStage(
                dim=stage_dim, depth=depths[i], num_heads=num_heads[i],
                window_size=window_size, input_resolution=stage_res,
                mlp_ratio=mlp_ratio, downsample=downsample
            ))

        self.final_dim = embed_dim * (2 ** (len(depths) - 1))
        self.norm = nn.LayerNorm(self.final_dim)

    def forward(self, x):
        x = self.patch_embed(x)
        H, W = self.patches_resolution
        for stage in self.stages:
            x, H, W = stage(x, H, W)
        x = self.norm(x)
        B, _, C = x.shape
        return x.view(B, H, W, C).permute(0, 3, 1, 2).contiguous()

class InvertedResBlock(nn.Module):
    def __init__(self, in_channels, expansion, stride, alpha, filters):
        super(InvertedResBlock, self).__init__()
        self.stride = stride
        pointwise_conv_filters = int(filters * alpha)
        self.pointwise_filters = _make_divisible(pointwise_conv_filters, 8)
        hidden_dim = expansion * in_channels
        self.use_res_connect = self.stride == 1 and in_channels == self.pointwise_filters

        layers = []
        if expansion != 1:
            layers.extend([
                nn.Conv2d(in_channels, hidden_dim, kernel_size=1, bias=False),
                nn.BatchNorm2d(hidden_dim, eps=1e-3, momentum=0.001),
                nn.ReLU6(inplace=True)
            ])
        layers.extend([
            nn.Conv2d(hidden_dim, hidden_dim, kernel_size=3, stride=stride,
                      padding=1, groups=hidden_dim, bias=False),
            nn.BatchNorm2d(hidden_dim, eps=1e-3, momentum=0.001),
            nn.ReLU6(inplace=True)
        ])
        layers.extend([
            nn.Conv2d(hidden_dim, self.pointwise_filters, kernel_size=1, bias=False),
            nn.BatchNorm2d(self.pointwise_filters, eps=1e-3, momentum=0.001)
        ])
        self.conv = nn.Sequential(*layers)

    def forward(self, x):
        if self.use_res_connect:
            return x + self.conv(x)
        return self.conv(x)

class HybridMobileNetSwin(nn.Module):
    def __init__(self, num_classes):
        super(HybridMobileNetSwin, self).__init__()
        
        mobilenet = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
        self.cnn_base = nn.Sequential(*list(mobilenet.features.children())[:8])
        self.cnn_se = SEBlock(in_channels=64, ratio=4)

        self.swin_branch = CustomSwinTBranch()
        self.swin_proj = nn.Conv2d(64, 48, kernel_size=1, bias=False)
        self.swin_upsample = nn.Upsample(size=(14, 14), mode='bilinear', align_corners=False)
        self.swin_se = SEBlock(in_channels=48, ratio=4)

        fusion_channels = 64 + 48
        self.fusion_block = InvertedResBlock(
            in_channels=fusion_channels, expansion=6, stride=2, alpha=1.0, filters=128
        )
        self.fusion_se = SEBlock(in_channels=128, ratio=4)

        self.gap = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(DROP_RATE)
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, x):
        cnn_feat = self.cnn_se(self.cnn_base(x))
        swin_feat = self.swin_branch(x)
        swin_feat = self.swin_proj(swin_feat)
        swin_feat = self.swin_upsample(swin_feat)
        swin_feat = self.swin_se(swin_feat)

        fused = torch.cat([cnn_feat, swin_feat], dim=1)
        out = self.fusion_se(self.fusion_block(fused))
        out = self.gap(out).flatten(1)
        return self.classifier(self.dropout(out))