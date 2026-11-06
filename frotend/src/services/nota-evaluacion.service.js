import api from './api';

export const notaEvaluacionService = {
  getAll: async () => (await api.get('/nota_evaluacion/')).data,
  getById: async (id) => (await api.get(`/nota_evaluacion/${id}`)).data,
  create: async (data) => (await api.post('/nota_evaluacion/', data)).data,
  update: async (id, data) => (await api.patch(`/nota_evaluacion/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/nota_evaluacion/${id}`)).data,
};

export default notaEvaluacionService;
