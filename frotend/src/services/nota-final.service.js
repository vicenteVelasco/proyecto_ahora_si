import api from './api';

export const notaFinalService = {
  getAll: async () => (await api.get('/nota_final/')).data,
  getById: async (id) => (await api.get(`/nota_final/${id}`)).data,
  getByEstudianteMateriaCurso: async (estudianteId, materiaId, cursoId) =>
    (await api.get(`/nota_final/estudiante/${estudianteId}/materia/${materiaId}/curso/${cursoId}`)).data,
  create: async (data) => (await api.post('/nota_final/', data)).data,
  calcular: async (estudianteId, materiaId, cursoId) =>
    (await api.post(`/nota_final/calcular/${estudianteId}/materia/${materiaId}/curso/${cursoId}`)).data,
  update: async (id, data) => (await api.patch(`/nota_final/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/nota_final/${id}`)).data,
};

export default notaFinalService;
