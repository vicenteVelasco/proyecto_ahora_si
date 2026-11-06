import api from './api';

export const personaService = {
  getAll: async () => (await api.get('/persona/')).data,
  getById: async (id) => (await api.get(`/persona/${id}`)).data,
  create: async (data) => (await api.post('/persona/', data)).data,
  update: async (id, data) => (await api.patch(`/persona/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/persona/${id}`)).data,
};

export default personaService;
