import api from './constants/api';


export const fetchUsers = async (page = 1) => {
  const res = await api.get(`/users`, { params: { page } });
  return res.data; 
};


export const fetchUser = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data; 
};

export const updateUser = async (id, payload) => {
  const res = await api.put(`/users/${id}`, payload);
  return res.data; 
};


export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data; 
};



export const fetchAllUsersLite = async (params = {}) => {
  try {
    const res = await api.get('/users', { params: { per_page: 100, ...params } });
    return res.data;
  } catch (error) {
    console.log('fetchAllUsersLite error:', error?.response?.data || error.message);
    return { status: false, data: [] };
  }
};