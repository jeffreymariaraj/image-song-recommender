import requests
import base64
import time
from typing import Dict, Any, List, Optional

class SpotifyClient:
    """
    Client for interacting with the Spotify Web API.
    Handles authentication and provides methods for searching and getting recommendations.
    """
    
    def __init__(self, client_id: str, client_secret: str):
        """
        Initialize the Spotify client with credentials.
        
        Args:
            client_id: Spotify API client ID
            client_secret: Spotify API client secret
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.token_expiry = 0
    
    def _get_auth_token(self) -> str:
        """
        Get a new auth token from Spotify using client credentials flow.
        
        Returns:
            Bearer token for API requests
        """
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode("utf-8")
        auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")
        
        url = "https://accounts.spotify.com/api/token"
        headers = {
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}
        
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        
        json_result = response.json()
        self.token = json_result["access_token"]
        self.token_expiry = time.time() + json_result["expires_in"]
        
        return self.token
    
    def _ensure_token(self) -> str:
        """
        Ensure we have a valid token, refreshing if necessary.
        
        Returns:
            Valid bearer token
        """
        if self.token is None or time.time() > self.token_expiry - 60:
            return self._get_auth_token()
        return self.token
    
    def search_tracks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for tracks on Spotify.
        
        Args:
            query: Search query string
            limit: Maximum number of results to return
            
        Returns:
            List of track objects
        """
        token = self._ensure_token()
        
        url = "https://api.spotify.com/v1/search"
        headers = {"Authorization": f"Bearer {token}"}
        params = {
            "q": query,
            "type": "track",
            "limit": limit
        }
        
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        json_result = response.json()
        tracks = []
        
        for item in json_result.get("tracks", {}).get("items", []):
            track = self._parse_track(item)
            if track:
                tracks.append(track)
        
        return tracks
    
    def get_recommendations_via_search(self, **params):
        """
        Alternative implementation that uses search API instead of recommendations
        since the recommendations endpoint is returning 404 errors.
        """
        token = self._ensure_token()
        
        # Extract parameters we might use
        seed_genres = params.get('seed_genres', 'pop')
        energy = params.get('target_energy', 0.5)
        valence = params.get('target_valence', 0.5)
        limit = params.get('limit', 10)
        
        # Construct a search query based on the genre
        if isinstance(seed_genres, list):
            # If it's a list, take the first one
            search_term = seed_genres[0] if seed_genres else 'pop'
        else:
            # If it's a string, use as is
            search_term = seed_genres
        
        # Create mood descriptors based on energy and valence
        mood_terms = []
        if valence > 0.7:
            mood_terms.append("happy")
        elif valence < 0.3:
            mood_terms.append("sad")
        
        if energy > 0.7:
            mood_terms.append("energetic")
        elif energy < 0.3:
            mood_terms.append("calm")
        
        # Add random mood qualifier if we have one
        search_query = search_term
        if mood_terms:
            import random
            search_query = f"{random.choice(mood_terms)} {search_term}"
        
        print(f"Using search query: '{search_query}' instead of recommendations")
        
        # Use the search API which we know is working
        url = "https://api.spotify.com/v1/search"
        headers = {"Authorization": f"Bearer {token}"}
        search_params = {
            "q": search_query,
            "type": "track",
            "limit": limit
        }
        
        print(f"Making search request to: {url}")
        print(f"With params: {search_params}")
        
        response = requests.get(url, headers=headers, params=search_params)
        print(f"Response status: {response.status_code}")
        
        try:
            response.raise_for_status()
            json_result = response.json()
            
            # Extract and parse tracks from response
            tracks = []
            for item in json_result.get("tracks", {}).get("items", []):
                track = self._parse_track(item)
                if track:
                    tracks.append(track)
            
            return tracks
        except Exception as e:
            print(f"Error getting search results: {e}")
            if hasattr(response, 'text'):
                print(f"Response text: {response.text}")
            return []
    
    def _parse_track(self, track_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parse a Spotify track object into a simplified format.
        
        Args:
            track_data: Raw track data from Spotify API
            
        Returns:
            Simplified track object with essential information
        """
        if not track_data:
            return None
        
        artists = []
        for artist in track_data.get("artists", []):
            artists.append({
                "name": artist.get("name", "Unknown Artist"),
                "id": artist.get("id")
            })
        
        album = track_data.get("album", {})
        album_images = album.get("images", [])
        album_image = album_images[0].get("url") if album_images else None
        
        # Extract preview URL if available
        preview_url = track_data.get("preview_url")
        
        return {
            "id": track_data.get("id"),
            "name": track_data.get("name", "Unknown Track"),
            "artists": artists,
            "album": {
                "name": album.get("name", "Unknown Album"),
                "id": album.get("id"),
                "image_url": album_image
            },
            "preview_url": preview_url,
            "external_url": track_data.get("external_urls", {}).get("spotify"),
            "popularity": track_data.get("popularity", 0),
            "explicit": track_data.get("explicit", False),
            "duration_ms": track_data.get("duration_ms", 0)
        }
    
    def get_available_genre_seeds(self):
        """
        Get a list of available genre seeds from Spotify.
        
        Returns:
            list: Available genre seeds
        """
        endpoint = "recommendations/available-genre-seeds"
        response = self._make_api_request(endpoint, method="GET")
        
        return response.get("genres", [])
    
    def _make_api_request(self, endpoint, method="GET", params=None, data=None):
        """
        Make a request to the Spotify API.
        
        Args:
            endpoint: API endpoint (without the base URL)
            method: HTTP method (GET, POST, etc.)
            params: URL parameters
            data: Body data for POST requests
            
        Returns:
            JSON response from the API
        """
        token = self._ensure_token()
        
        url = f"https://api.spotify.com/v1/{endpoint}"
        headers = {"Authorization": f"Bearer {token}"}
        
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, params=params, json=data)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        
        return response.json()
    
    def debug_list_genres(self):
        """Simply print all available genres for debugging"""
        token = self._ensure_token()
        
        # Ensure proper URL format
        url = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            # Print debug info
            print(f"Token: {token[:10]}...")
            print(f"Making request to: {url}")
            
            response = requests.get(url, headers=headers)
            print(f"Response status: {response.status_code}")
            
            response.raise_for_status()
            genres = response.json().get("genres", [])
            print("===== AVAILABLE SPOTIFY GENRES =====")
            print(genres)
            print(f"Total genres: {len(genres)}")
            print("===================================")
            return genres
        except Exception as e:
            print(f"Error getting genres: {e}")
            if hasattr(response, 'text'):
                print(f"Response text: {response.text}")
            return [] 