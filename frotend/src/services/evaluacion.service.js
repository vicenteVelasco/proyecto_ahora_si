import api from './api';

export const evaluacionService = {
  getAll: async () => (await api.get('/evaluacion/')).data,
  getById: async (id) => (await api.get(`/evaluacion/${id}`)).data,
  create: async (data) => (await api.post('/evaluacion/', data)).data,
  update: async (id, data) => (await api.patch(`/evaluacion/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/evaluacion/${id}`)).data,
};

export default evaluacionService;
