import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from image_analyzer import analyze_image
from music_recommender import get_music_recommendations
from spotify_client import SpotifyClient
import base64

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Initialize Spotify client
spotify_client = SpotifyClient(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET')
)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Check if image is present in request
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    # Save file with unique name to prevent conflicts
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(filepath)
    
    try:
        # Analyze the image
        image_features = analyze_image(filepath)
        
        # Get music recommendations based on image features
        recommendations = get_music_recommendations(image_features, spotify_client)
        
        # Clean up the uploaded file
        os.remove(filepath)
        
        return jsonify({
            "success": True,
            "image_features": image_features,
            "recommendations": recommendations
        })
    
    except Exception as e:
        # Ensure we always return valid JSON, even for errors
        import traceback
        traceback.print_exc()  # Print the full error to console
        
        # Return a proper JSON error response
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/test-spotify', methods=['GET'])
def test_spotify():
    """Test endpoint to verify Spotify API connection"""
    try:
        # Get a token
        token = spotify_client._ensure_token()
        
        # Try to get available genres
        genres = spotify_client.debug_list_genres()
        
        # Try to get a simple recommendation
        try:
            tracks = spotify_client.get_recommendations(seed_genres="pop", limit=2)
            track_names = [t.get('name', 'Unknown') for t in tracks]
        except Exception as e:
            track_names = []
            print(f"Error getting tracks: {e}")
        
        return jsonify({
            "status": "ok",
            "token_obtained": bool(token),
            "genres_count": len(genres),
            "sample_genres": genres[:5] if genres else [],
            "recommendations_working": len(track_names) > 0,
            "sample_tracks": track_names
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/test-spotify-token', methods=['GET'])
def test_spotify_token():
    try:
        # Create a direct request to Spotify token endpoint
        auth_url = 'https://accounts.spotify.com/api/token'
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        # Check if credentials are set
        if not client_id or not client_secret:
            return jsonify({
                "status": "error",
                "error": "Spotify credentials not found in environment variables",
                "client_id_set": bool(client_id),
                "client_secret_set": bool(client_secret)
            }), 400
        
        # Basic authorization header
        auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode('ascii')).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {'grant_type': 'client_credentials'}
        
        import requests
        response = requests.post(auth_url, headers=headers, data=data)
        
        # Return full details for debugging
        return jsonify({
            "status": "response_received",
            "status_code": response.status_code,
            "response_text": response.text[:500],  # First 500 chars
            "client_id_length": len(client_id) if client_id else 0,
            "client_secret_length": len(client_secret) if client_secret else 0
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG', 'False') == 'True', host='0.0.0.0', port=int(os.getenv('PORT', 5000))) 