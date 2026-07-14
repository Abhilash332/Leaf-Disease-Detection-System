import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeafDetector() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState('idle');
    const [prediction, setPrediction] = useState(null);
    const [confidence, setConfidence] = useState(null); // New state variable

    // Read the base URL from the environment variables
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStatus('idle');
            setPrediction(null);
            setConfidence(null); // Reset confidence
            setJobId(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('leaf_image', selectedFile);

        try {
            // Using the environment variable for the upload endpoint
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setJobId(response.data.job_id);
            setStatus('processing');
        } catch (error) {
            console.error("Upload failed:", error);
            setStatus('failed');
        }
    };

    useEffect(() => {
        let intervalId;

        const checkJobStatus = async () => {
            if (!jobId || status !== 'processing') return;

            try {
                // Using the environment variable for the polling endpoint
                const response = await axios.get(`${API_BASE_URL}/status/${jobId}`);
                
                if (response.data.status === 'completed') {
                    const resultData = response.data.result;
                    
                    // Unpacking the new object format from the Node.js backend
                    if (resultData && typeof resultData === 'object') {
                        setPrediction(resultData.prediction);
                        setConfidence(resultData.confidence);
                    } else {
                        // Fallback handling just in case
                        setPrediction(resultData);
                        setConfidence(null);
                    }
                    
                    setStatus('completed');
                    clearInterval(intervalId);
                } else if (response.data.status === 'failed') {
                    setStatus('failed');
                    clearInterval(intervalId);
                }
            } catch (error) {
                console.error("Status check failed:", error);
                setStatus('failed');
                clearInterval(intervalId);
            }
        };

        if (status === 'processing') {
            intervalId = setInterval(checkJobStatus, 2000);
        }

        return () => clearInterval(intervalId);
    }, [jobId, status, API_BASE_URL]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md font-sans">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Plant Disease Detection</h2>
            
            <div className="mb-6">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
            </div>
            
            {previewUrl && (
                <div className="mb-6">
                    <img src={previewUrl} alt="Leaf preview" className="w-full rounded-lg shadow-sm" />
                </div>
            )}

            <button 
                onClick={handleUpload} 
                disabled={!selectedFile || status === 'uploading' || status === 'processing'}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {status === 'idle' && 'Analyze Leaf'}
                {status === 'uploading' && 'Uploading...'}
                {status === 'processing' && 'Model Analyzing...'}
                {(status === 'completed' || status === 'failed') && 'Analyze Another Leaf'}
            </button>

            <div className="mt-6">
                {status === 'processing' && (
                    <div className="flex justify-center items-center space-x-2 text-blue-600">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing with Swin Transformer...</span>
                    </div>
                )}
                
                {status === 'failed' && (
                    <p className="text-center text-red-600 font-medium bg-red-50 p-3 rounded-md">Analysis failed. Please check server logs.</p>
                )}
                
                {status === 'completed' && prediction && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
                        <h3 className="text-green-800 font-semibold text-lg mb-2">Analysis Complete</h3>
                        <p className="text-green-900 font-bold text-xl mb-1">{prediction}</p>
                        
                        {/* Rendering the confidence metric dynamically */}
                        {confidence && (
                            <p className="text-sm text-green-700 font-medium">
                                Model Confidence: <span className="font-semibold text-green-800">{confidence}</span>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}