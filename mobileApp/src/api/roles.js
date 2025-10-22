import api from './constants/api';

export const fetchRoles = async () => {
  const res = await api.get('/roles');
  return res.data; 
};

export const updateRolePermissions = async (roleId, payload) => {
  
  const res = await api.put(`/roles/${roleId}`, payload);
  return res.data; 
};
