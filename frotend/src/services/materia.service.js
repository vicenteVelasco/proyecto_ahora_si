import api from './api';

export const materiaService = {
  getAll: async () => (await api.get('/materia/')).data,
  getById: async (id) => (await api.get(`/materia/${id}`)).data,
  create: async (data) => (await api.post('/materia/', data)).data,
  update: async (id, data) => (await api.patch(`/materia/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/materia/${id}`)).data,
};

export default materiaService;
