import API from './index';

export const getDashboardStats = () => API.get('/analytics/dashboard');
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
