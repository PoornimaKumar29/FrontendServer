import torch
from torchvision import transforms
from PIL import Image
from train_model import SimpleCNN  # Import the model class

# Load the saved model
model = SimpleCNN()  # Create an instance of your model
model.load_state_dict(torch.load('server_detection_model.pth'))  # Load the state dict
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
        return

    img = transform(img)  # Apply transformations
    img = img.unsqueeze(0)  # Add batch dimension

    with torch.no_grad():  # Disable gradient calculation
        logits = model(img)  # Forward pass
        prob = torch.softmax(logits, dim=1)  # Apply softmax
        idx = torch.argmax(prob).item()  # Get the predicted class index

    print(f'Predicted class: {class_labels[idx]} (Confidence: {prob[0][idx]:.2f})')

# Test with an image path (update this path as needed)
if __name__ == "__main__":
    test_image_path = "C:\\Users\\2000153451\\Desktop\\ServerAnonmaly_detection\\Backend\\cpu_usage_images\\cpu_usage_images\\warning\\warning_0703.png"  # Ensure this path is correct
    predict(test_image_path)