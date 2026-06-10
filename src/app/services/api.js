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
  baseURL:         import.meta.env.VITE_API_URL || 'https://import-export-jhik.onrender.com/api',
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

// Helper to recursively map id -> _id for frontend compatibility
const addUnderscoreId = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(addUnderscoreId);
  }
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = addUnderscoreId(obj[key]);
    }
  }
  if (newObj.id && newObj._id === undefined) {
    newObj._id = newObj.id;
  }
  return newObj;
};

// ── Response interceptor: handle 401 globally & map id to _id ──
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = addUnderscoreId(response.data);
    }
    return response;
  },
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

// ════════════════════════════════════════════════════════════
//  BUYER SERVICE (Admin only)
// ════════════════════════════════════════════════════════════
export const buyerService = {
  getAll:   (params) => api.get('/buyers', { params }),
  getById:  (id)     => api.get(`/buyers/${id}`),
  create:   (data)   => api.post('/buyers', data),
  update:   (id, d)  => api.put(`/buyers/${id}`, d),
  delete:   (id)     => api.delete(`/buyers/${id}`),
};

// ════════════════════════════════════════════════════════════
//  QUOTATION SERVICE (Admin only)
// ════════════════════════════════════════════════════════════
export const quotationService = {
  getAll:   (params) => api.get('/quotations', { params }),
  getById:  (id)     => api.get(`/quotations/${id}`),
  getPdf:   (id)     => api.get(`/quotations/${id}/pdf`, { responseType: 'blob' }),
  create:   (data)   => api.post('/quotations', data),
  update:   (id, d)  => api.put(`/quotations/${id}`, d),
  delete:   (id)     => api.delete(`/quotations/${id}`),
};

// ════════════════════════════════════════════════════════════
//  CMS SERVICE
// ════════════════════════════════════════════════════════════
export const cmsService = {
  getTestimonials:    (p)    => api.get('/cms/testimonials', { params: p }),
  createTestimonial:  (d)    => api.post('/cms/testimonials', d),
  updateTestimonial:  (id,d) => api.put(`/cms/testimonials/${id}`, d),
  deleteTestimonial:  (id)   => api.delete(`/cms/testimonials/${id}`),
  reorderTestimonials:(orderedIds) => api.put('/cms/testimonials/reorder', { orderedIds }),
  getFaqs:            (p)    => api.get('/cms/faqs', { params: p }),
  createFaq:          (d)    => api.post('/cms/faqs', d),
  updateFaq:          (id,d) => api.put(`/cms/faqs/${id}`, d),
  deleteFaq:          (id)   => api.delete(`/cms/faqs/${id}`),
  getStats:           ()     => api.get('/cms/stats'),
  updateStats:        (d)    => api.put('/cms/stats', d),
};

// ════════════════════════════════════════════════════════════
//  SETTINGS SERVICE (Admin only)
// ════════════════════════════════════════════════════════════
export const settingsService = {
  getAll:   ()    => api.get('/settings'),
  update:   (d)   => api.put('/settings', d),
};

// ════════════════════════════════════════════════════════════
//  ACTIVITY LOG SERVICE (Admin only)
// ════════════════════════════════════════════════════════════
export const activityLogService = {
  getAll: (p) => api.get('/activity-logs', { params: p }),
};

// ════════════════════════════════════════════════════════════
//  INQUIRY NOTES (Admin only)
// ════════════════════════════════════════════════════════════
export const inquiryNoteService = {
  getAll:    (inquiryId)       => api.get(`/inquiries/${inquiryId}/notes`),
  addNote:   (inquiryId, note) => api.post(`/inquiries/${inquiryId}/notes`, { note }),
};

export default api;

