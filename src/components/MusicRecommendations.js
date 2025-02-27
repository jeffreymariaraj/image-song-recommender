import React, { useState, useContext } from 'react';
import { ThemeContext } from '../App';

const MusicRecommendations = ({ recommendations }) => {
  const { isDark } = useContext(ThemeContext);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  
  // Handle audio preview playing
  const handlePlayPreview = (trackId, previewUrl) => {
    // If already playing, stop it
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
      return;
    }
    
    // If no preview URL, do nothing
    if (!previewUrl) return;
    
    // Otherwise play the preview
    setPlayingTrackId(trackId);
  };
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Music Recommendations</h2>
        <p className="text-gray-600">No music recommendations found that match this image.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        Recommended Music
      </h2>
      <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Based on the mood, colors, and content of your image, here are some songs you might enjoy:
      </p>
      
      <div className="space-y-4">
        {recommendations.map((track) => {
          const isPlaying = playingTrackId === track.id;
          const hasPreview = !!track.preview_url;
          
          return (
            <div 
              key={track.id}
              className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
                         transform hover:-translate-y-1 overflow-hidden border
                         bg-white dark:bg-dark-surface
                         border-gray-100 dark:border-gray-700
                         hover:bg-gray-50 dark:hover:bg-dark-primary"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Album artwork with improved styling */}
                <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden">
                  {track.album.image_url ? (
                    <img 
                      src={track.album.image_url} 
                      alt={`${track.album.name} cover`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 
                                  flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Track details with improved typography */}
                <div className="p-6 flex-grow">
                  <h3 className="font-bold text-xl mb-1 text-gray-800 dark:text-dark-text-primary">
                    {track.name}
                  </h3>
                  <p className="font-medium text-purple-600 dark:text-purple-400">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                  <p className="text-sm mt-2 text-gray-500 dark:text-dark-text-muted">
                    {track.album.name}
                  </p>
                </div>
                
                {/* Genre tags with improved styling */}
                {track.match_factors && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {track.match_factors.genres.map((genre, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 
                                   rounded-full font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Controls with improved button styling */}
              <div className="p-6 flex items-center space-x-4">
                <button
                  onClick={() => handlePlayPreview(track.id, track.preview_url)}
                  disabled={!hasPreview}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center 
                    transition-all duration-300 transform hover:scale-110
                    ${hasPreview 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                  `}
                  title={hasPreview ? "Play preview" : "No preview available"}
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                {/* Spotify button with improved styling */}
                {track.external_url && (
                  <a
                    href={track.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-green-500 hover:text-green-600 
                             transition-all duration-300 transform hover:scale-110"
                    title="Open in Spotify"
                  >
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicRecommendations; 