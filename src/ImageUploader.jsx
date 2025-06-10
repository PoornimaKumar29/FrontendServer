import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setPrediction(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await axios.post('http://localhost:5000/predict', formData, { // Correct endpoint
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPrediction(response.data);
        } catch (err) {
            setError('Error uploading image. Please try again.');
            if (err.response) {
                setError(`Error: ${err.response.data.error}`); // Display backend error
            } else {
                setError('Error uploading image. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Image Classifier</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {prediction && (
                <div>
                    <h2>Prediction: {prediction.class}</h2>
                    <p>Confidence: {prediction.confidence.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
