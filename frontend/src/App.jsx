import { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Handle the file selection and create a preview image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null); // Clear previous results
      setError(null);
    }
  };

  // 2. Send the image to the Express backend
  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    // Package the file into a FormData object (required for file uploads)
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      // Send to your Node.js Gateway on Port 5000
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with the server.");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-md w-full space-y-8 text-center mb-8">
        <h1 className="text-4xl font-extrabold text-green-700">
          PlantCare AI
        </h1>
        <p className="mt-2 text-gray-600">
          Upload a photo of a plant leaf to instantly detect diseases using our deep learning model.
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        {/* Upload Section */}
        <div className="flex flex-col items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">JPG, PNG, or JPEG</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mt-6">
            <img src={preview} alt="Leaf preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className={`mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
            !selectedFile || loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {loading ? 'Analyzing Plant...' : 'Diagnose Disease'}
        </button>

        {/* Results Section */}
        {result && (
          <div className="mt-8 overflow-hidden rounded-lg border border-green-200 shadow-sm">
            {/* Header */}
            <div className="bg-green-50 p-6 border-b border-green-200">
              <h3 className="text-sm font-medium text-green-800 uppercase tracking-wide">Diagnosis Result</h3>
              <p className="mt-2 text-2xl font-bold text-green-900 break-words">
                {result.disease.replace(/___/g, ' - ').replace(/_/g, ' ')}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-green-700 font-medium">Confidence Score:</span>
                <span className="text-lg font-bold text-green-900">
                  {(result.confidence * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Precautions Section */}
            {result.details && (
              <div className="bg-white p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">About this Condition</h4>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {result.details.description}
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                <ul className="space-y-2">
                  {result.details.precautions.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;