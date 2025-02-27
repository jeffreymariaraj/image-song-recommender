import axios from 'axios';

// Base URL for API calls - set this to your Flask backend URL
// In development, this might be localhost, in production your deployed backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Sends an image to the backend for analysis and gets music recommendations
 * @param {FormData} formData - FormData object containing the image file
 * @returns {Promise<Object>} - Promise resolving to the API response
 */
export const analyzeImage = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    // Handle and transform error for consistent error handling in UI
    console.error('API error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const serverError = error.response.data.error || 'Server error occurred';
      throw new Error(serverError);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error sending request: ' + error.message);
    }
  }
};

/**
 * Simple health check to verify backend is running
 * @returns {Promise<boolean>} - Promise resolving to true if backend is healthy
 */
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}; 