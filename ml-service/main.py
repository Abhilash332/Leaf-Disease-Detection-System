import os
import io
import json
import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from torchvision import transforms
from PIL import Image
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()
MODEL_PATH = os.getenv("MODEL_PATH", "model.pt")
CLASSES_PATH = os.getenv("CLASSES_PATH", "classes.json")

# 2. Initialize FastAPI
app = FastAPI(title="PlantVillage Disease Detection API")

# 3. Determine device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 4. Load PlantVillage classes dynamically
try:
    with open(CLASSES_PATH, "r") as f:
        CLASSES = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"Critical Error: {CLASSES_PATH} not found. Cannot map predictions to classes.")

# 5. Load the model globally on startup
try:
    # If the file contains only the state dictionary (recommended):
    # model = SwinTransformer(...) # You would need your model class definition here
    # model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    
    # If you saved the full model using torch.save(model, 'model.pt'):
    model = torch.load(MODEL_PATH, map_location=device)
    model.eval()
except Exception as e:
    raise RuntimeError(f"Critical Error: Failed to load model from {MODEL_PATH}. Details: {e}")

# 6. Define Swin Transformer preprocessing (ImageNet standards)
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # Read and convert the image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Preprocess the tensor
        input_tensor = preprocess(image).unsqueeze(0).to(device)
        
        # Inference
        with torch.no_grad():
            outputs = model(input_tensor)
            _, predicted_idx = torch.max(outputs, 1)
            
            idx = predicted_idx.item()
            
            # Map index to PlantVillage class securely
            if idx < len(CLASSES):
                predicted_class = CLASSES[idx]
                
                # Optional string formatting to make the JSON response cleaner
                # e.g. "Apple___Apple_scab" -> "Apple - Apple scab"
                clean_class_name = predicted_class.replace("___", " - ").replace("_", " ")
            else:
                clean_class_name = f"Unknown Class ID: {idx}"
            
        return {
            "status": "success",
            "prediction": clean_class_name,
            "filename": file.filename
        }
        
    except Exception as e:
        # Log the actual error internally, but return a clean 500 status to the client
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during model inference.")