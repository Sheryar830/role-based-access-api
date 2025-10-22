import api from './constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const loginUser = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (error) {
    throw error;
  }
};


export const setAuthToken = token => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};


export const registerUser = async (name, email, password) => {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
};



export const logoutUser = async (navigation, setUser) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      await api.post(
        '/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch (e) {
    console.log('Server logout failed:', e?.response?.data || e.message);
  } finally {
   
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setAuthToken(null);
    if (setUser) setUser(null);

    // ✅ reset navigation stack completely to Login
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }
};


export const getProfile = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};