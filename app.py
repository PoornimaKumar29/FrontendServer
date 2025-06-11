import os
from flask import Flask, request, jsonify
from flask_cors import CORS  
from werkzeug.utils import secure_filename
import torch
from torchvision import transforms
from PIL import Image
from train_model import SimpleCNN  # Import the model class

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'  # Create this folder in your backend directory
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the saved model
model = SimpleCNN()  # Create an instance of your model
model.load_state_dict(torch.load('server_detection_model.pth', map_location=torch.device('cpu')))  # Load the state dict
model.eval()  # Set the model to evaluation mode

# Manually set the class labels exactly as your folders
class_labels = ['high', 'normal', 'warning']  # Replace with your actual class folder names

# Define the image transformations
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

def predict(path):
    print(f"Attempting to open image at: {path}")  # Debugging line
    try:
        img = Image.open(path).convert('RGB')  # Load the image
    except FileNotFoundError:
        print(f"Error: The file at {path} was not found.")
        return None, None # Return None for both class and confidence

    img = transform(img)  # Apply transformations
    img = img.unsqueeze(0)  # Add batch dimension

    with torch.no_grad():  # Disable gradient calculation
        logits = model(img)  # Forward pass
        prob = torch.softmax(logits, dim=1)  # Apply softmax
        idx = torch.argmax(prob).item()  # Get the predicted class index

    predicted_class = class_labels[idx]
    confidence = prob[0][idx].item()

    print(f'Predicted class: {predicted_class} (Confidence: {confidence:.2f})')
    return predicted_class, confidence

@app.route('/predict', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected image'}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)  # Save the uploaded image

        predicted_class, confidence = predict(filepath)  # Call predict function

        if predicted_class is None:
            return jsonify({'error': 'Prediction failed'}), 500

        return jsonify({'class': predicted_class, 'confidence': confidence})

    return jsonify({'error': 'Upload failed'}), 500

if __name__ == '__main__':
    app.run(debug=True)
    
