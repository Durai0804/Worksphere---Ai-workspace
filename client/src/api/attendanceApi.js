import API from './index';

export const checkIn = () => API.post('/attendance/checkin');
export const checkOut = () => API.post('/attendance/checkout');
export const getTodayAttendance = () => API.get('/attendance/today');
export const getAttendanceHistory = (params) => API.get('/attendance/history', { params });
export const getAllTodayAttendance = () => API.get('/attendance/all-today');
export const getMonthlySummary = (params) => API.get('/attendance/monthly-summary', { params });
