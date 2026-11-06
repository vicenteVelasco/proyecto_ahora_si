import api from './api';

export const profesorMateriaService = {
  getAll: async () => (await api.get('/profesor_materia_curso/')).data,
  getById: async (id) => (await api.get(`/profesor_materia_curso/${id}`)).data,
  create: async (data) => (await api.post('/profesor_materia_curso/', data)).data,
  update: async (id, data) => (await api.patch(`/profesor_materia_curso/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/profesor_materia_curso/${id}`)).data,
};

export default profesorMateriaService;
