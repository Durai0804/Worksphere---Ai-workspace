import API from './index';

export const applyLeave = (data) => API.post('/leaves', data);
export const getLeaves = (params) => API.get('/leaves', { params });
export const getLeaveBalance = () => API.get('/leaves/balance');
export const updateLeaveStatus = (id, data) => API.put(`/leaves/${id}/status`, data);
export const getLeaveStats = () => API.get('/leaves/stats');
