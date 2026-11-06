import api from './api';

export const auditoriaService = {
  getAll: async () => (await api.get('/auditoria/')).data,
};

export default auditoriaService;
