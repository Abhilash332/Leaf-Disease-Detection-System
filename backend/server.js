import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import 'dotenv/config'; 

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize the Cloud Redis Connection
const redisConnection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

// 2. System Design: Persistent Message Queue
const imageQueue = new Queue('leaf-processing-queue', { 
    connection: redisConnection 
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5, 
    message: { error: "Too many requests. Please wait a minute." },
    standardHeaders: true,
    legacyHeaders: false,
});

const upload = multer({ storage: multer.memoryStorage() });

// 3. System Design: Background Worker (Listens to Redis)
// This automatically picks up jobs placed into the Redis queue
const worker = new Worker('leaf-processing-queue', async (job) => {
    const { imageBuffer, originalName } = job.data;
    
    // Convert the base64 string back to a buffer for FastAPI
    const buffer = Buffer.from(imageBuffer, 'base64');
    
    const formData = new FormData();
    formData.append('file', buffer, originalName);

    const response = await axios.post(process.env.ML_SERVICE_URL, formData, {
        headers: formData.getHeaders()
    });

    // BullMQ automatically saves this return value in Redis
    return {
        prediction: response.data.prediction,
        confidence: response.data.confidence
    };
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});

// 4. API Route: Push to Redis Queue
app.post('/api/upload', uploadLimiter, upload.single('leaf_image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image provided.' });
    }

    try {
        // Convert buffer to base64 so it can be safely stored in Redis JSON
        const base64Image = req.file.buffer.toString('base64');

        // Add the job to Upstash Redis
        const job = await imageQueue.add('analyze-leaf', {
            imageBuffer: base64Image,
            originalName: req.file.originalname
        });

        res.status(202).json({ 
            message: 'Image successfully queued for analysis', 
            job_id: job.id 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to queue.' });
    }
});

// 5. API Route: Poll Redis for Status
app.get('/api/status/:jobId', async (req, res) => {
    try {
        const job = await imageQueue.getJob(req.params.jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Job identifier not found.' });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        res.json({ 
            job_id: job.id, 
            status: state, // 'waiting', 'active', 'completed', 'failed'
            result: result || null 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Node.js Backend active on port ${PORT} using Upstash Redis`);
});