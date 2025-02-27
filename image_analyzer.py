import os
from typing import Dict, Any, List
from PIL import Image
from google.cloud import vision
from google.oauth2 import service_account
import json
import io
import colorsys

def analyze_image(image_path: str) -> Dict[str, Any]:
    """
    Analyze an image using Google Cloud Vision API and extract relevant features.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary containing extracted features:
            - dominant_colors: List of dominant colors with their RGB values and scores
            - labels: List of detected objects/scenes with confidence scores
            - emotions: Dict of detected emotions and their confidence scores
            - texts: List of extracted text
    """
    
    # Get credentials from env or file
    credentials_json = os.getenv('GOOGLE_CLOUD_CREDENTIALS')
    if credentials_json:
        # Create credentials from JSON string in env variable
        service_account_info = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(service_account_info)
    else:
        # Fall back to credentials file
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if not credentials_path or not os.path.exists(credentials_path):
            raise ValueError("Google Cloud credentials not found. Please set GOOGLE_CLOUD_CREDENTIALS environment variable.")
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
    
    # Initialize client
    client = vision.ImageAnnotatorClient(credentials=credentials)
    
    # Load image into memory
    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()
    
    image = vision.Image(content=content)
    
    # Request features from Vision API
    features = [
        {"type_": vision.Feature.Type.IMAGE_PROPERTIES},
        {"type_": vision.Feature.Type.LABEL_DETECTION, "max_results": 10},
        {"type_": vision.Feature.Type.FACE_DETECTION},
        {"type_": vision.Feature.Type.TEXT_DETECTION},
    ]
    
    # Make API request
    response = client.annotate_image({
        "image": image,
        "features": features,
    })
    
    # Extract dominant colors
    dominant_colors = []
    if response.image_properties_annotation:
        for color in response.image_properties_annotation.dominant_colors.colors:
            r, g, b = color.color.red, color.color.green, color.color.blue
            
            # Convert RGB to HSV for better music mapping
            h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
            
            dominant_colors.append({
                "rgb": {"r": r, "g": g, "b": b},
                "hsv": {"h": h, "s": s, "v": v},
                "score": color.score,
                "pixel_fraction": color.pixel_fraction
            })
    
    # Extract labels (objects/scenes)
    labels = []
    if response.label_annotations:
        for label in response.label_annotations:
            labels.append({
                "description": label.description,
                "score": label.score
            })
    
    # Extract emotions from faces
    emotions = {
        "joy": 0,
        "sorrow": 0,
        "anger": 0,
        "surprise": 0
    }
    
    if response.face_annotations:
        face_count = len(response.face_annotations)
        if face_count > 0:
            for face in response.face_annotations:
                emotions["joy"] += face.joy_likelihood / face_count
                emotions["sorrow"] += face.sorrow_likelihood / face_count
                emotions["anger"] += face.anger_likelihood / face_count
                emotions["surprise"] += face.surprise_likelihood / face_count
    
    # Extract text
    texts = []
    if response.text_annotations:
        for text in response.text_annotations:
            texts.append({
                "text": text.description,
                "locale": text.locale if hasattr(text, 'locale') else None
            })
    
    # Get basic image properties
    image_obj = Image.open(image_path)
    width, height = image_obj.size
    brightness = get_average_brightness(image_obj)
    
    return {
        "dominant_colors": dominant_colors,
        "labels": labels,
        "emotions": emotions,
        "texts": texts,
        "width": width,
        "height": height,
        "brightness": brightness
    }

def get_average_brightness(image: Image.Image) -> float:
    """
    Calculate the average brightness of an image on a scale of 0 to 1.
    
    Args:
        image: PIL Image object
        
    Returns:
        Average brightness value (0.0 to 1.0)
    """
    # Convert to grayscale
    gray_image = image.convert('L')
    histogram = gray_image.histogram()
    pixels = sum(histogram)
    brightness = sum(i * histogram[i] for i in range(256)) / pixels
    
    # Normalize to 0-1
    return brightness / 255 