import diseaseData from "./diseaseData.js";
import express, { json } from "express";
import cors from "cors";
import multer, { memoryStorage } from "multer";
import axios from "axios";
import FormData from "form-data";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this backend
app.use(json());

// Set up Multer to store uploaded files temporarily in RAM (MemoryStorage)
const upload = multer({ storage: memoryStorage() });

// The main route to handle image uploads
app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
        // 1. Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided." });
        }

        console.log(`Received file: ${req.file.originalname}`);

        // 2. Prepare the file to be sent to Python
        // We use form-data to mimic a real HTML form submission
        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);

        // 3. Forward the image to your Python Microservice
        console.log("Forwarding to Python microservice...");
        const pythonResponse = await axios.post("http://127.0.0.1:8000/predict", formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        const predictedClass = pythonResponse.data.disease;
        const confidence = pythonResponse.data.confidence;

        // 4. Look up the precautions in our knowledge base
        // If the disease isn't in our file yet, provide a fallback message
        const plantInfo = diseaseData[predictedClass] || {
            description: "Information currently unavailable for this specific condition.",
            precautions: ["Please consult a local agricultural expert."]
        };

        // 5. Send the combined data back to the React frontend
        console.log("Sending complete diagnosis to client.");
        res.json({
            disease: predictedClass,
            confidence: confidence,
            details: plantInfo
        });

    } catch (error) {
        console.error("Error communicating with Python service:", error.message);
        res.status(500).json({ error: "Failed to analyze image." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express Gateway is running on http://localhost:${PORT}`);
});