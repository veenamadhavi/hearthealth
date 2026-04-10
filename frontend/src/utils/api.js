import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  patientRegister: (data) => api.post('/auth/patient/register', data),
  doctorRegister: (data) => api.post('/auth/doctor/register', data),
  patientLogin: (data) => api.post('/auth/patient/login', data),
  doctorLogin: (data) => api.post('/auth/doctor/login', data),
};

export const heartAPI = {
  analyze: (frames) => api.post('/heart/analyze', { frames }),
  history: () => api.get('/heart/history'),
  latest: () => api.get('/heart/latest'),
  report: (id) => api.get(`/heart/report/${id}`),
};

export const doctorAPI = {
  list: (params) => api.get('/doctors', { params }),
  get: (id) => api.get(`/doctors/${id}`),
  me: () => api.get('/doctors/me'),
};

export const consultationAPI = {
  create: (data) => api.post('/consultations', data),
  my: () => api.get('/consultations/my'),
  pending: () => api.get('/consultations/pending'),
  doctorAll: () => api.get('/consultations/doctor/all'),
  respond: (id, data) => api.put(`/consultations/${id}/respond`, data),
  get: (id) => api.get(`/consultations/${id}`),
};

export const chatAPI = {
  messages: (consultationId) => api.get(`/chat/${consultationId}`),
  send: (consultationId, content) => api.post(`/chat/${consultationId}`, { content }),
};

export default api;
