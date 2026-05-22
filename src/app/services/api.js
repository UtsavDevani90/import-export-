// src/app/services/api.js — Axios API service layer
// This is the single place your frontend talks to the backend.
// Import individual services in your components.
//
// Usage:
//   import { inquiryService } from '../services/api';
//   const { data } = await inquiryService.submit(formData);

import axios from 'axios';

// ── Base Axios instance ───────────────────────────────────────
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,        // Send cookies with every request
  timeout:         15000,       // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT from localStorage ─────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tanzora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tanzora_token');
      // Optional: redirect to /login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════════
//  AUTH SERVICE
// ════════════════════════════════════════════════════════════
export const authService = {
  login:  (email, password) => api.post('/auth/login', { email, password }),
  logout: ()                => api.post('/auth/logout'),
  getMe:  ()                => api.get('/auth/me'),
};

// ════════════════════════════════════════════════════════════
//  PRODUCTS SERVICE
// ════════════════════════════════════════════════════════════
export const productService = {
  getAll:    (params)      => api.get('/products', { params }),
  getById:   (idOrSlug)    => api.get(`/products/${idOrSlug}`),

  // Admin
  create:    (formData)    => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:    (id, data)    => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete:    (id)          => api.delete(`/products/${id}`),
  getAllAdmin: (params)    => api.get('/products/admin/all', { params }),
};

// ════════════════════════════════════════════════════════════
//  INQUIRY SERVICE
// ════════════════════════════════════════════════════════════
export const inquiryService = {
  // Called by the Contact page form
  submit:        (data)    => api.post('/inquiries', data),

  // Admin
  getAll:        (params)  => api.get('/inquiries', { params }),
  getById:       (id)      => api.get(`/inquiries/${id}`),
  updateStatus:  (id, status, adminNotes) =>
                              api.put(`/inquiries/${id}/status`, { status, adminNotes }),
  delete:        (id)      => api.delete(`/inquiries/${id}`),
};

// ════════════════════════════════════════════════════════════
//  BLOG SERVICE
// ════════════════════════════════════════════════════════════
export const blogService = {
  getAll:    (params)      => api.get('/blogs', { params }),
  getBySlug: (slug)        => api.get(`/blogs/${slug}`),

  // Admin
  create:    (formData)    => api.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:    (id, data)    => api.put(`/blogs/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete:    (id)          => api.delete(`/blogs/${id}`),
};

// ════════════════════════════════════════════════════════════
//  CERTIFICATE SERVICE
// ════════════════════════════════════════════════════════════
export const certificateService = {
  getAll:    (params)      => api.get('/certificates', { params }),

  // Admin
  upload:    (formData)    => api.post('/certificates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:    (id, data)    => api.put(`/certificates/${id}`, data),
  delete:    (id)          => api.delete(`/certificates/${id}`),
};

// ════════════════════════════════════════════════════════════
//  DASHBOARD SERVICE (Admin only)
// ════════════════════════════════════════════════════════════
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
