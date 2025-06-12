
// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css'; // Import the CSS file

// const ImageUploader = () => {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [predictionStatus, setPredictionStatus] = useState(null);
//     const [predictions, setPredictions] = useState([]); // Store predictions
//     const [images, setImages] = useState([]); // Store image paths

//     const startPrediction = async () => {
//         setLoading(true);
//         setError(null);
//         setPredictions([]); // Clear previous predictions
//         setImages([]); // Clear previous images
//         try {
//             const response = await axios.post('http://localhost:5000/start_prediction'); // Update URL if needed
//             setPredictionStatus(response.data.message);
//             fetchResults(); // Call a function to fetch results
//         } catch (err) {
//             setError('Error starting prediction. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const stopPrediction = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await axios.post('http://localhost:5000/stop_prediction'); // Update URL if needed
//             setPredictionStatus(response.data.message);
//         } catch (err) {
//             setError('Error stopping prediction. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchResults = async () => {
//         const interval = setInterval(async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/get_latest_predictions'); // Create this endpoint
//                 setPredictions(prev => [...prev, response.data.prediction]); // Append new predictions
//                 setImages(prev => [...prev, response.data.image]); // Append new images
//             } catch (err) {
//                 console.error('Error fetching predictions:', err);
//                 clearInterval(interval); // Stop fetching if there's an error
//             }
//         }, 5000); // Fetch every 5 seconds

//         return () => clearInterval(interval); // Cleanup on component unmount
//     };

//     return (
//         <div className="container">
//             <header className="header">
//                 <h1 className="title">Server Anomaly Detection</h1>
//             </header>

//             <section className="controlSection">
//                 <button onClick={startPrediction} disabled={loading} className="controlButton">
//                     {loading ? 'Starting...' : 'Start Prediction'}
//                 </button>
//                 <button onClick={stopPrediction} disabled={loading} className="controlButton">
//                     {loading ? 'Stopping...' : 'Stop Prediction'}
//                 </button>
//             </section>

//             {error && <p className="error">{error}</p>}
//             {predictionStatus && <p className="status">{predictionStatus}</p>}

//             <section className="resultsSection">
//     <h2>Prediction Results</h2>
//     {predictions.map((prediction, index) => (
//         <div key={index}>
//             <p>Prediction: {prediction.class} (Confidence: {(prediction.confidence * 100).toFixed(2)}%)</p>
//             {images[index] && (
//                 <img
//                     src={`http://localhost:5000/images/all_graphs/${images[index]}`} // Use the correct path to the image
//                     alt={`Prediction ${index}`}
//                     className="predictedImage"
//                 />
//             )}
//         </div>
       
//     ))}
// </section>


//         </div>
//     );
// };

// export default ImageUploader;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageUploader = () => {
    const [isPredicting, setIsPredicting] = useState(false);
    const [latestPrediction, setLatestPrediction] = useState(null);
    const [latestImage, setLatestImage] = useState(null);

    const startPrediction = async () => {
        try {
            const response = await axios.post('http://localhost:5000/start_prediction');
            if (response.status === 200) {
                setIsPredicting(true);
                fetchLatestPrediction();
            }
        } catch (error) {
            console.error("Error starting prediction:", error);
        }
    };

    const stopPrediction = async () => {
        try {
            const response = await axios.post('http://localhost:5000/stop_prediction');
            if (response.status === 200) {
                setIsPredicting(false);
            }
        } catch (error) {
            console.error("Error stopping prediction:", error);
        }
    };

    const fetchLatestPrediction = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get_latest_predictions');
            if (response.status === 200) {
                setLatestPrediction(response.data.prediction);
                setLatestImage(response.data.image);
            }
        } catch (error) {
            console.error("Error fetching latest predictions:", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPredicting) {
                fetchLatestPrediction();
            }
        }, 2000); // Fetch every 2 seconds while predicting

        return () => clearInterval(interval); // Cleanup on unmount
    }, [isPredicting]);

    return (
        <div>
            <h1>Automated Prediction System</h1>
            <button onClick={startPrediction} disabled={isPredicting}>
                Start Prediction
            </button>
            <button onClick={stopPrediction} disabled={!isPredicting}>
                Stop Prediction
            </button>

            {latestPrediction && (
                <div>
                    <h2>Latest Prediction</h2>
                    <p>Class: {latestPrediction.class}</p>
                    <p>Confidence: {latestPrediction.confidence.toFixed(2)}</p>
                    {latestImage && (
                        <img src={`http://localhost:5000/images/${latestImage.split('/').pop()}`} alt="Latest Prediction" />
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
