import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // La URL donde arranca tu backend FastAPI
  withCredentials: true // Fundamental para enviar y recibir cookies automáticamente
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/acceso' && !path.startsWith('/acceso')) {
          window.location.href = '/acceso';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
