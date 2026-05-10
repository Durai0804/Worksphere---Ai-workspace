import API from './index';

export const sendMessage = (message) => API.post('/ai/chat', { message });
