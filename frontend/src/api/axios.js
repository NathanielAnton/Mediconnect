import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Fonction pour récupérer le CSRF token
const getCSRFToken = async () => {
  try {
    
    const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const xsrfToken = getCookie('XSRF-TOKEN');
    
    return xsrfToken;
  } catch (error) {
    return null;
  }
};

// Helper function pour récupérer les cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Intercepteur pour ajouter le CSRF token
api.interceptors.request.use(async (config) => {
  if (!config.url.includes('sanctum/csrf-cookie')) {
    let xsrfToken = getCookie('XSRF-TOKEN');
    
    if (!xsrfToken) {
      xsrfToken = await getCSRFToken();
    }
    
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
  }
  
  return config;
});

// Intercepteur de réponse pour debug
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;