import os
import requests
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_spotify_api():
    # Get credentials from .env
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    print(f"Testing with client ID: {client_id[:5]}... (length: {len(client_id)})")
    print(f"Testing with client secret: {client_secret[:5]}... (length: {len(client_secret)})")
    
    # Get a token
    auth_url = 'https://accounts.spotify.com/api/token'
    auth_header = f"{client_id}:{client_secret}"
    auth_bytes = auth_header.encode('ascii')
    auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
    
    headers = {
        'Authorization': f'Basic {auth_base64}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {'grant_type': 'client_credentials'}
    response = requests.post(auth_url, headers=headers, data=data)
    response.raise_for_status()
    token_data = response.json()
    access_token = token_data['access_token']
    
    print(f"Successfully got access token: {access_token[:10]}...")
    print(f"Full token (for direct testing): {access_token}")
    
    # Try multiple API endpoints to debug the issue
    test_endpoints = [
        # Standard endpoints
        ('https://api.spotify.com/v1/recommendations/available-genre-seeds', {}),
        ('https://api.spotify.com/v1/recommendations', {'seed_genres': 'pop', 'limit': 2}),
        
        # Alternative formats
        ('https://api.spotify.com/v1/search', {'q': 'pop', 'type': 'track', 'limit': 1}),
        ('https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl', {}),
    ]
    
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    # Test each endpoint
    for url, params in test_endpoints:
        print(f"\nTesting endpoint: {url}")
        print(f"With params: {params}")
        
        response = requests.get(url, headers=headers, params=params)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("Success!")
            response_data = response.json()
            if 'tracks' in response_data:
                print(f"Found {len(response_data['tracks'])} tracks")
            elif 'genres' in response_data:
                print(f"Found {len(response_data['genres'])} genres")
            else:
                print("Data returned successfully")
        else:
            print(f"Error response: {response.text}")

if __name__ == "__main__":
    test_spotify_api()