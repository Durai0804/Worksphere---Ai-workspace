import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => {
    const data = response.data?.data;
    if (data) {
      resolveAvatarUrls(data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function resolveRelativeUrl(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) {
    const base = BASE_URL.replace('/api', '');
    return `${base}${path}`;
  }
  return path;
}

function resolveAvatarUrls(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach(resolveAvatarUrls); return; }
  if (obj.avatar) obj.avatar = resolveRelativeUrl(obj.avatar);
  if (obj.profileImage) obj.profileImage = resolveRelativeUrl(obj.profileImage);
  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object') resolveAvatarUrls(val);
  }
}

export default API;
