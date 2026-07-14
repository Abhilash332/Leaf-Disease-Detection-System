import os
import io
import json
import torch
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from torchvision import transforms
from PIL import Image
from dotenv import load_dotenv
import torchvision.models as models
import torch.nn as nn

# Importing your custom architecture blueprint
from model_architecture import HybridMobileNetSwin

load_dotenv()
MODEL_PATH = os.getenv("MODEL_PATH", "model.pt")
CLASSES_PATH = os.getenv("CLASSES_PATH", "classes.json")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Create a global dictionary to hold the model so it can be shared with endpoints
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    
    # 1. Load classes FIRST so we know how many output nodes the model needs
    try:
        with open(CLASSES_PATH, "r") as f:
            ml_models["classes"] = json.load(f)
            num_classes = len(ml_models["classes"])
    except FileNotFoundError:
        raise RuntimeError("Failed to load classes.json on startup.")

    print(f"Loading ConSwinTX-Lite Architecture on {device}...")
    try:
        # 2. Initialize the empty custom architecture using the class we imported
        model = HybridMobileNetSwin(num_classes=num_classes)
        
        # 3. Load the dictionary of trained weights
        state_dict = torch.load(MODEL_PATH, map_location=device)
        
        # 4. Inject the weights into the empty architecture
        model.load_state_dict(state_dict)
        
        # 5. Move to GPU/CPU and set to evaluation mode
        model.to(device)
        model.eval()
        
        ml_models["plant_model"] = model
        print("Model and weights loaded successfully!")
    except Exception as e:
        raise RuntimeError(f"Failed to load model on startup: {e}")

    # Yield hands control back to FastAPI so it can start taking user requests.
    yield
    
    # --- SHUTDOWN LOGIC ---
    print("Shutting down API. Clearing model from memory...")
    ml_models.clear()
    
# Initialize FastAPI and pass in the lifespan context manager
app = FastAPI(title="PlantDisease API", lifespan=lifespan)

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = preprocess(image).unsqueeze(0).to(device)
        
        # Access the model and classes from the shared global dictionary
        model = ml_models["plant_model"]
        classes = ml_models["classes"]
        
        with torch.no_grad():
            # 1. Get raw scores (logits) from the model
            outputs = model(input_tensor)
            
            # 2. Convert logits to standard probabilities (0.0 to 1.0) using Softmax
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
            # 3. Get the highest probability and its corresponding class index
            max_prob, predicted_idx = torch.max(probabilities, 1)
            
            idx = predicted_idx.item()
            confidence_percentage = max_prob.item() * 100  # Convert to a percentage
            
            if idx < len(classes):
                predicted_class = classes[idx].replace("___", " - ").replace("_", " ")
            else:
                predicted_class = f"Unknown Class ID: {idx}"
            
        # 4. Return both the prediction and the formatted confidence score
        return {
            "status": "success", 
            "prediction": predicted_class,
            "confidence": f"{confidence_percentage:.2f}%"
        }
        
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail="Inference failed.")