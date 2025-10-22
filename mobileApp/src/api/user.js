import api from './constants/api';

export const getProfile = async () => {
  const res = await api.get('/profile');
  return res.data;
};

export const updateProfile = async ({ name, email, password }) => {
  const payload = { name, email };
  if (password && password.trim().length > 0) payload.password = password;
  const res = await api.put('/profile', payload);
  return res.data;
};


export const changePassword = async ({
  current_password,
  password,
  password_confirmation,
}) => {

  const res = await api.put('/profile/password', {
    current_password,
    password,
    password_confirmation,
  });
  return res.data; 
};