import React, { useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImage } from '../services/api';
import { ThemeContext } from '../App';

const ImageUploader = ({ setIsLoading, setError, setRecommendations, setImagePreview, setImageFeatures, resetState }) => {
  const { isDark } = useContext(ThemeContext);
  
  // Handle file drop or selection
  const onDrop = useCallback(async (acceptedFiles) => {
    // Only process the first file if multiple files are dropped
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Reset previous state
    resetState();
    
    // Create and set image preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Start loading state
    setIsLoading(true);
    
    try {
      // Create form data for API request
      const formData = new FormData();
      formData.append('image', file);
      
      // Send to backend for analysis
      const result = await analyzeImage(formData);
      
      // Update state with results
      setRecommendations(result.recommendations);
      setImageFeatures(result.image_features);
      setIsLoading(false);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error.message || 'Failed to analyze image. Please try again.');
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setRecommendations, setImagePreview, setImageFeatures, resetState]);
  
  // Configure react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });
  
  return (
    <div className="mt-8">
      <div 
        {...getRootProps()} 
        className={`
          border-3 border-dashed rounded-xl p-12 
          transition-all duration-300 ease-in-out
          transform hover:scale-[1.02]
          ${
            isDragActive 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : isDark
                ? 'border-gray-600 hover:border-purple-400 hover:bg-purple-900/20'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center">
          <svg 
            className={`w-20 h-20 mb-6 transition-colors duration-300 ${
              isDragActive ? 'text-purple-500' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          
          <h3 className="mb-3 text-xl font-semibold text-gray-700">
            {isDragActive ? 'Drop your image here' : 'Drag & drop your image here'}
          </h3>
          
          <p className="mb-6 text-gray-500">
            or click to browse from your device
          </p>
          
          <button className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
            Choose File
          </button>
          
          <p className="mt-6 text-sm text-gray-400">
            Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Your image will be processed to extract colors, objects, and mood to find matching music.
        </p>
      </div>
    </div>
  );
};

export default ImageUploader; 