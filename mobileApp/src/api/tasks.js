import api from './constants/api';

export const fetchTasks = async (params = {}) => {
  const res = await api.get('/tasks', { params });
  return res.data; 
};


export const createTask = async (payload) => {
  const res = await api.post('/tasks', payload);
  return res.data; 
};

export const updateTask = async (id, payload) => {
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data; 
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data; 
};
