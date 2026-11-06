import api from './api';

export const cursoService = {
  getAll: async () => (await api.get('/curso/')).data,
  getById: async (id) => (await api.get(`/curso/${id}`)).data,
  create: async (data) => (await api.post('/curso/', data)).data,
  update: async (id, data) => (await api.patch(`/curso/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/curso/${id}`)).data,
};

export default cursoService;
