import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/persona/login', { email, password });
    return response.data;
  },
  logout: () => {
    // La cookie es httpOnly, no se puede eliminar desde JS.
    // Se limpia el estado local del frontend.
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      window.location.href = '/acceso';
    }
  }
};

export default authService;
