import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import MusicRecommendations from './components/MusicRecommendations';
import './styles/main.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFeatures, setImageFeatures] = useState(null);

  // Reset the state when starting a new analysis
  const resetState = () => {
    setError(null);
    setRecommendations(null);
    setImageFeatures(null);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Image to Music</h1>
          <p className="mt-2 text-indigo-100">
            Upload any image and discover music that matches its mood and content
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!recommendations && (
          <div className="max-w-3xl mx-auto">
            <ImageUploader 
              setIsLoading={setIsLoading} 
              setError={setError}
              setRecommendations={setRecommendations}
              setImagePreview={setImagePreview}
              setImageFeatures={setImageFeatures}
              resetState={resetState}
            />
            
            {error && (
              <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <h3 className="font-semibold">Error</h3>
                <p>{error}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Analyzing your image and finding matching music...</p>
              </div>
            )}
          </div>
        )}

        {recommendations && (
          <div>
            <button 
              className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => {
                resetState();
                setImagePreview(null);
              }}
            >
              ← Upload Another Image
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                {imagePreview && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Your Image</h2>
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={imagePreview} 
                        alt="Uploaded" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    
                    {imageFeatures && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">Detected Features</h3>
                        <div className="bg-white rounded-lg shadow p-4">
                          {imageFeatures.labels && imageFeatures.labels.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-600">Content</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {imageFeatures.labels.slice(0, 5).map((label, index) => (
                                  <span key={index} className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                                    {label.description}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {imageFeatures.emotions && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-600">Mood</h4>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {Object.entries(imageFeatures.emotions)
                                  .filter(([_, value]) => value > 0)
                                  .map(([emotion, value]) => (
                                    <div key={emotion} className="flex items-center">
                                      <span className="text-xs text-gray-700 capitalize">{emotion}</span>
                                      <div className="ml-2 w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-indigo-500 h-2 rounded-full" 
                                          style={{ width: `${value * 20}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-2">
                <MusicRecommendations recommendations={recommendations} />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-12 py-6 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>Image to Music Recommendation App</p>
          <p className="mt-2">
            Powered by Google Cloud Vision API and Spotify API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 