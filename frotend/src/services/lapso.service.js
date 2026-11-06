import api from './api';

export const lapsoService = {
  getAll: async () => (await api.get('/lapso/')).data,
  getById: async (id) => (await api.get(`/lapso/${id}`)).data,
  create: async (data) => (await api.post('/lapso/', data)).data,
  update: async (id, data) => (await api.patch(`/lapso/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/lapso/${id}`)).data,
};

export default lapsoService;
