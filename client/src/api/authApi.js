import API from './index';

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updatePassword = (data) => API.put('/auth/password', data);
export const updateProfile = (data) => API.put('/auth/profile', data);
