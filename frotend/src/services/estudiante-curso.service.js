import api from './api';

export const estudianteCursoService = {
  getAll: async () => (await api.get('/estudiante_curso/')).data,
  getById: async (id) => (await api.get(`/estudiante_curso/${id}`)).data,
  create: async (data) => (await api.post('/estudiante_curso/', data)).data,
  update: async (id, data) => (await api.patch(`/estudiante_curso/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/estudiante_curso/${id}`)).data,
};

export default estudianteCursoService;
