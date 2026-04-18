import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

/* =========================
   TOKEN INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hh_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH API
========================= */
export const authAPI = {
  patientRegister: (data) =>
    api.post('/auth/patient/register', data),

  doctorRegister: (data) =>
    api.post('/auth/doctor/register', data),

  patientLogin: (data) =>
    api.post('/auth/patient/login', data),

  doctorLogin: (data) =>
    api.post('/auth/doctor/login', data),
};

/* =========================
   HEART API
========================= */
export const heartAPI = {
  analyze: (frames) =>
    api.post('/heart/analyze', { frames }),

  history: () =>
    api.get('/heart/history'),

  latest: () =>
    api.get('/heart/latest'),

  report: (id) =>
    api.get(`/heart/report/${id}`),
};

/* =========================
   DOCTOR API
========================= */
export const doctorAPI = {
  // main
  list: (params) =>
    api.get('/doctors', { params }),

  // aliases
  getAll: () =>
    api.get('/doctors'),

  fetchAll: () =>
    api.get('/doctors'),

  get: (id) =>
    api.get(`/doctors/${id}`),

  getById: (id) =>
    api.get(`/doctors/${id}`),

  me: () =>
    api.get('/doctors/me'),
};

/* =========================
   CONSULTATION API
========================= */
export const consultationAPI = {
  create: (data) =>
    api.post('/consultations', data),

  // patient
  my: () =>
    api.get('/consultations/my'),

  getMyConsultations: () =>
    api.get('/consultations/my'),

  fetchMyConsultations: () =>
    api.get('/consultations/my'),

  // doctor
  pending: () =>
    api.get('/consultations/pending'),

  doctorAll: () =>
    api.get('/consultations/doctor/all'),

  getDoctorConsultations: () =>
    api.get('/consultations/doctor/all'),

  fetchDoctorConsultations: () =>
    api.get('/consultations/doctor/all'),

  // update
  respond: (id, data) =>
    api.put(`/consultations/${id}/respond`, data),

  updateStatus: (id, data) =>
    api.put(`/consultations/${id}/respond`, data),

  // single
  get: (id) =>
    api.get(`/consultations/${id}`),

  getById: (id) =>
    api.get(`/consultations/${id}`),

  fetchById: (id) =>
    api.get(`/consultations/${id}`),
};

/* =========================
   CHAT API
========================= */
export const chatAPI = {
  // fetch messages
  messages: (consultationId) =>
    api.get(`/chat/${consultationId}`),

  getMessages: (consultationId) =>
    api.get(`/chat/${consultationId}`),

  fetchMessages: (consultationId) =>
    api.get(`/chat/${consultationId}`),

  // send
  send: (consultationId, content) =>
    api.post(`/chat/${consultationId}`, {
      content,
    }),

  sendMessage: (consultationId, content) =>
    api.post(`/chat/${consultationId}`, {
      content,
    }),
};

export default api;