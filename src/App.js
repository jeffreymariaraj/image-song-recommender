import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import MusicRecommendations from './components/MusicRecommendations';
import './styles/main.css';

// Add this at the top of the file, before the App component
export const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => {},
});

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFeatures, setImageFeatures] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // Reset the state when starting a new analysis
  const resetState = () => {
    setError(null);
    setRecommendations(null);
    setImageFeatures(null);
  };

  // Add theme toggle function
  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue);
      
      // Toggle the 'dark' class on the HTML element
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newValue;
    });
  };

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme !== null ? JSON.parse(savedTheme) : prefersDark;
    
    setIsDark(shouldBeDark);
    
    // Add or remove the 'dark' class from the HTML element
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`min-h-screen ${isDark ? 'dark bg-dark-bg' : 'bg-gray-50'}`}>
        <header className={`bg-gradient-to-r transition-colors duration-300 ${
          isDark 
            ? 'from-purple-900/80 via-violet-900/80 to-purple-900/80' 
            : 'from-purple-800 via-violet-900 to-purple-800'
        } text-white py-12 shadow-xl`}>
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-100">
                Image to Music
              </h1>
              <p className="mt-4 text-lg text-center text-purple-200 max-w-2xl">
                Transform your images into musical experiences
              </p>
            </div>
            
            {/* Dark mode toggle button */}
            <button
              onClick={toggleTheme}
              className={`
                p-3 rounded-full 
                transition-all duration-500 ease-in-out
                transform hover:scale-110
                ${isDark 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-purple-100 hover:bg-purple-200'
                }
                shadow-lg hover:shadow-xl
                relative
                overflow-hidden
                group
              `}
              aria-label="Toggle dark mode"
            >
              {/* Sun icon */}
              <svg
                className={`w-6 h-6 transition-all duration-500 ease-in-out transform 
                  ${isDark 
                    ? 'rotate-90 opacity-0 scale-0' 
                    : 'rotate-0 opacity-100 scale-100'
                  }
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  text-yellow-500
                `}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>

              {/* Moon icon */}
              <svg
                className={`w-6 h-6 transition-all duration-500 ease-in-out transform
                  ${isDark 
                    ? 'rotate-0 opacity-100 scale-100' 
                    : '-rotate-90 opacity-0 scale-0'
                  }
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  text-purple-300
                `}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>

              {/* Background animation */}
              <span
                className={`
                  absolute inset-0 rounded-full
                  transition-all duration-500 ease-in-out
                  ${isDark
                    ? 'bg-gradient-to-r from-purple-900 to-indigo-900 opacity-100'
                    : 'bg-gradient-to-r from-yellow-300 to-purple-100 opacity-0'
                  }
                  group-hover:opacity-100
                `}
              />
            </button>
          </div>
        </header>

        <main className={`container mx-auto px-4 py-12 min-h-[calc(100vh-200px)] ${
          isDark ? 'text-dark-text-primary' : 'text-gray-900'
        }`}>
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
                <div className={`mt-6 p-4 rounded-md ${
                  isDark 
                    ? 'bg-red-900/20 border-red-800 text-red-200' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  <h3 className="font-semibold">Error</h3>
                  <p>{error}</p>
                </div>
              )}
              
              {isLoading && (
                <div className="mt-8 flex flex-col items-center justify-center">
                  <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${
                    isDark ? 'border-purple-500' : 'border-indigo-500'
                  }`}></div>
                  <p className={`mt-4 ${
                    isDark ? 'text-dark-text-secondary' : 'text-gray-600'
                  }`}>
                    Analyzing your image and finding matching music...
                  </p>
                </div>
              )}
            </div>
          )}

          {recommendations && (
            <div>
              <button 
                className={`mb-6 px-4 py-2 rounded-md transition-colors ${
                  isDark 
                    ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
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
                      <h2 className={`text-xl font-semibold mb-3 ${
                        isDark ? 'text-dark-text-primary' : 'text-gray-900'
                      }`}>
                        Your Image
                      </h2>
                      <div className={`rounded-lg overflow-hidden shadow-lg ${
                        isDark ? 'shadow-black/20' : ''
                      }`}>
                        <img 
                          src={imagePreview} 
                          alt="Uploaded" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      
                      {imageFeatures && (
                        <div className="mt-4">
                          <h3 className={`text-lg font-medium mb-2 ${
                            isDark ? 'text-dark-text-primary' : 'text-gray-900'
                          }`}>
                            Detected Features
                          </h3>
                          <div className={`rounded-lg shadow p-4 ${
                            isDark ? 'bg-dark-surface' : 'bg-white'
                          }`}>
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
        
        <footer className={`py-8 mt-auto transition-colors duration-300 ${
          isDark 
            ? 'bg-dark-surface text-dark-text-muted' 
            : 'bg-gray-900 text-gray-400'
        }`}>
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg font-semibold mb-2">Image to Music Recommendation App</p>
            <p className="text-sm">
              Crafted with <span className="text-red-500">♥</span> using Google Cloud Vision API and Spotify API
            </p>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
}

export default App; 