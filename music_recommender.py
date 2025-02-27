from typing import Dict, Any, List
from spotify_client import SpotifyClient

def get_music_recommendations(image_features: Dict[str, Any], spotify_client: SpotifyClient) -> List[Dict[str, Any]]:
    """
    Generate music recommendations based on image features.
    
    Args:
        image_features: Dictionary containing features extracted from the image
        spotify_client: Initialized SpotifyClient instance
        
    Returns:
        List of recommended tracks with their details
    """
    # Get valid genres from Spotify
    try:
        available_genres = spotify_client.get_available_genre_seeds()
        print(f"Available Spotify genres: {available_genres[:10]}...")  # Print first 10 for debugging
    except Exception as e:
        print(f"Warning: Couldn't get available genres: {e}")
        available_genres = []  # Use a default fallback list
    
    # Extract relevant features
    colors = image_features.get('dominant_colors', [])
    labels = image_features.get('labels', [])
    emotions = image_features.get('emotions', {})
    brightness = image_features.get('brightness', 0.5)
    
    # Define mappings
    
    # Map image brightness to audio features
    energy = brightness
    valence = 0.5  # Default neutral valence (happiness)
    
    # Adjust valence based on detected emotions
    if emotions:
        joy_level = emotions.get('joy', 0)
        sadness_level = emotions.get('sorrow', 0)
        
        # Joy increases valence, sadness decreases it
        valence = 0.5 + (joy_level * 0.1) - (sadness_level * 0.1)
        
        # Clamp values between 0 and 1
        valence = max(0.0, min(1.0, valence))
    
    # Map color to audio features and genres
    tempo = 0
    genres = []
    
    if colors:
        main_color = colors[0]
        hue = main_color.get('hsv', {}).get('h', 0)
        saturation = main_color.get('hsv', {}).get('s', 0)
        value = main_color.get('hsv', {}).get('v', 0)
        
        # Map hue to genres
        if 0 <= hue < 0.05 or hue >= 0.95:  # Red
            genres.extend(['rock', 'metal', 'punk'])
            tempo += 150
        elif 0.05 <= hue < 0.17:  # Orange
            genres.extend(['pop', 'reggae', 'latin'])
            tempo += 110
        elif 0.17 <= hue < 0.33:  # Yellow
            genres.extend(['pop', 'dance', 'happy'])
            tempo += 120
        elif 0.33 <= hue < 0.5:  # Green
            genres.extend(['chill', 'ambient', 'acoustic'])
            tempo += 95
        elif 0.5 <= hue < 0.66:  # Blue
            genres.extend(['jazz', 'blues', 'r-n-b'])
            tempo += 85
        elif 0.66 <= hue < 0.83:  # Indigo/Purple
            genres.extend(['electronic', 'edm', 'synth'])
            tempo += 130
        else:  # Violet/Pink
            genres.extend(['pop', 'dance', 'disco'])
            tempo += 120
        
        # Saturation affects intensity - higher saturation = more intense genres
        if saturation > 0.7:
            intensity_genres = ['electronic', 'rock', 'metal', 'edm']
            genres = [g for g in genres if g in intensity_genres] or genres
        
        # Value (brightness) affects energy
        energy = value
    
    # Add genres based on detected objects/scenes
    genre_mappings = {
        'beach': ['reggae', 'surf rock', 'tropical house'],
        'mountain': ['folk', 'ambient', 'acoustic'],
        'city': ['hip hop', 'r&b', 'electronic'],
        'forest': ['folk', 'acoustic', 'ambient'],
        'night': ['electronic', 'chill', 'lo-fi'],
        'sunset': ['indie', 'chill', 'ambient'],
        'concert': ['rock', 'live', 'pop'],
        'party': ['dance', 'pop', 'hip hop'],
        'nature': ['acoustic', 'folk', 'ambient'],
        'food': ['jazz', 'lounge', 'bossa nova'],
        'person': ['pop', 'r&b', 'soul'],
        'animal': ['folk', 'classical', 'world'],
        'water': ['ambient', 'chill', 'electronic'],
        'sky': ['ambient', 'classical', 'post-rock'],
    }
    
    for label in labels:
        description = label.get('description', '').lower()
        for key, mapped_genres in genre_mappings.items():
            if key in description:
                genres.extend(mapped_genres)
    
    # Get seed genres (max 5 for Spotify API)
    unique_genres = list(set(genres))[:5]
    
    # If no genres were identified, use some defaults
    if not unique_genres:
        unique_genres = ['pop', 'rock', 'electronic']
    
    # Filter genres to ensure they're valid
    valid_genres = [genre for genre in unique_genres if genre in available_genres]
    if not valid_genres:
        valid_genres = ["pop"]  # Fallback to a safe genre
    
    # Ensure we have valid genre strings
    print(f"Valid genres before: {valid_genres}")  # Debugging

    # Ensure we have complete genre strings, not individual characters
    if valid_genres and isinstance(valid_genres[0], str) and len(valid_genres[0]) == 1:
        # We have individual characters instead of genre names
        valid_genres = ["pop"]  # Fall back to a reliable genre

    print(f"Valid genres after: {valid_genres}")  # Debugging

    # At the top, after getting available_genres:
    print("\n===== TESTING SPOTIFY CONNECTION =====")
    test_genres = spotify_client.debug_list_genres()
    print("======================================\n")

    # Replace the params section with:
    params = {
        'seed_genres': 'pop',  # Start with a reasonable default
        'target_energy': energy,
        'target_valence': valence,
        'limit': 10
    }

    # Just to be safe, ensure seed_genres is a valid genre
    if test_genres and 'pop' not in test_genres and test_genres:
        # Use first available genre if pop is not available
        params['seed_genres'] = test_genres[0]
        print(f"Using {params['seed_genres']} as fallback genre")

    # Add tempo if it was determined
    if tempo > 0:
        params['target_tempo'] = tempo

    # Before get_recommendations call
    print("DEBUG - Final params being sent to Spotify:", params)
    print("DEBUG - seed_genres type:", type(params['seed_genres']))
    print("DEBUG - seed_genres value:", params['seed_genres'])

    # Get recommendations from Spotify
    tracks = spotify_client.get_recommendations_via_search(**params)
    
    # Add image analysis context to the response
    for track in tracks:
        track['match_factors'] = {
            'energy': energy,
            'valence': valence,
            'genres': valid_genres,
        }
        
        if tempo > 0:
            track['match_factors']['tempo'] = tempo
    
    # Test with minimal parameters
    try:
        print("\n===== TESTING SPOTIFY MINIMAL PARAMS =====")
        minimal_tracks = spotify_client.get_recommendations(seed_genres="pop", limit=5)
        print(f"Got {len(minimal_tracks)} tracks with minimal params")
        print("=========================================\n")
    except Exception as e:
        print(f"Error with minimal params: {e}")

    # If no tracks were returned from Spotify, use hardcoded fallback recommendations
    if not tracks:
        print("No tracks returned from Spotify API, using fallback recommendations")
        
        # Create fallback tracks based on the detected emotions
        fallback_tracks = []
        
        # Check which emotions were detected
        emotions = image_features.get('emotions', {})
        joy_level = emotions.get('joy', 0)
        sadness_level = emotions.get('sorrow', 0)
        anger_level = emotions.get('anger', 0)
        
        # Select genre based on dominant emotion
        if joy_level > 0.5:
            mood_description = "happy"
            fallback_genre = "pop"
        elif sadness_level > 0.5:
            mood_description = "melancholic"
            fallback_genre = "classical"
        elif anger_level > 0.5:
            mood_description = "intense"
            fallback_genre = "rock"
        else:
            mood_description = "balanced"
            fallback_genre = "indie"
        
        # Create 3 fallback tracks
        for i in range(3):
            track_num = i + 1
            fallback_tracks.append({
                "id": f"fallback-{track_num}",
                "name": f"Fallback Track {track_num}",
                "artists": [{"name": "AI Music Recommender", "id": "ai-recommender"}],
                "album": {
                    "name": f"{mood_description.capitalize()} Mood Music",
                    "id": "fallback-album",
                    "image_url": "https://via.placeholder.com/300?text=AI+Music+Recommendation"
                },
                "preview_url": None,
                "external_url": "https://open.spotify.com",
                "popularity": 50,
                "explicit": False,
                "duration_ms": 180000,
                "match_factors": {
                    "energy": energy,
                    "valence": valence,
                    "genres": [fallback_genre],
                    "fallback": True,
                    "reason": "Could not connect to Spotify API"
                }
            })
        
        return fallback_tracks
    
    return tracks 