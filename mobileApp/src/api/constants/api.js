import axios from 'axios';


const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api', 
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

export const fetchAllUsersLite = async () => {
  const res = await api.get('/users', { params: { per_page: 100 } });
  return res.data; 
};
export default api;



