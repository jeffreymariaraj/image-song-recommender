# Image-to-Music Recommendation App

An application that analyzes images and recommends music that matches the mood and content of the image.

## Features

- Image upload and analysis
- Extraction of mood, colors, and content from images
- Music recommendations based on image analysis
- Song preview functionality

## Technologies

### Backend
- Python/Flask
- Google Cloud Vision API for image analysis
- Spotify API for music recommendations

### Frontend
- React
- Tailwind CSS
- Axios for API requests

## Setup and Installation

### Prerequisites
- Python 3.9+
- Node.js and npm
- Spotify Developer account
- Google Cloud account with Vision API enabled

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/image-to-music-app.git
   cd image-to-music-app
   ```

2. Backend setup
   ```
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Update .env with your API keys
   ```

3. Frontend setup
   ```
   cd frontend
   npm install
   ```

### Running the application
1. Start the backend
   ```
   cd backend
   python app.py
   ```

2. Start the frontend
   ```
   cd frontend
   npm start
   ```

## License
[MIT](LICENSE)
