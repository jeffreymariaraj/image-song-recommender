import React, { useState } from 'react';

const MusicRecommendations = ({ recommendations }) => {
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
      <h2 className="text-xl font-semibold mb-4">Recommended Music</h2>
      <p className="mb-6 text-gray-600">
        Based on the mood, colors, and content of your image, here are some songs you might enjoy:
      </p>
      
      <div className="space-y-4">
        {recommendations.map((track) => {
          const isPlaying = playingTrackId === track.id;
          const hasPreview = !!track.preview_url;
          
          return (
            <div 
              key={track.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Album artwork */}
                <div className="w-full sm:w-24 h-24 flex-shrink-0">
                  {track.album.image_url ? (
                    <img 
                      src={track.album.image_url} 
                      alt={`${track.album.name} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Track details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{track.name}</h3>
                    <p className="text-gray-600">
                      {track.artists.map(artist => artist.name).join(', ')}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{track.album.name}</p>
                  </div>
                  
                  {/* Match factors */}
                  {track.match_factors && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {track.match_factors.genres.map((genre, index) => (
                          <span key={index} className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="p-4 flex items-center space-x-3">
                  {/* Preview button */}
                  <button
                    onClick={() => handlePlayPreview(track.id, track.preview_url)}
                    disabled={!hasPreview}
                    className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${hasPreview 
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`
                    }
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
                  
                  {/* Open in Spotify button */}
                  {track.external_url && (
                    <a
                      href={track.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:text-green-800"
                      title="Open in Spotify"
                    >
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              
              {/* Audio player (hidden, controlled by play button) */}
              {track.preview_url && isPlaying && (
                <audio
                  src={track.preview_url}
                  autoPlay
                  onEnded={() => setPlayingTrackId(null)}
                  className="hidden"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicRecommendations; 