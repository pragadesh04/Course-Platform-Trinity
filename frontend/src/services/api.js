import { API_BASE_URL, STORAGE_KEYS } from '../config';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(data.detail.map(e => e.loc ? `${e.loc.join('.')}: ${e.msg}` : String(e)).join(', '));
        }
        throw new Error(data.detail || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const categoryService = {
  getAll: (type) => api.get(`/categories${type ? `?type=${type}` : ''}`),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const courseService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/courses${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getProgress: (courseId) => api.get(`/courses/${courseId}/progress`),
  saveProgress: (courseId, data) => api.post(`/courses/${courseId}/progress`, data),
  generateTitle: (title) => api.post('/courses/ai/generate-title', { title }),
  generateDescription: (title) => api.post('/courses/ai/generate-description', { title }),
  generateLearnings: (title, description) => api.post('/courses/ai/generate-details', { title, description }),
};

export const productService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  generateTitle: (title) => api.post('/products/ai/generate-title', { title }),
  generateDescription: (title) => api.post('/products/ai/generate-description', { title }),
  generateFeatures: (title, description) => api.post('/products/ai/generate-features', { title, description }),
  generateTags: (title, description) => api.post('/products/ai/generate-tags', { title, description }),
};

export const orderService = {
  getMyOrders: () => api.get('/orders'),
  getAllOrders: () => api.get('/orders/all'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const enrollmentService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/enrollments${query ? `?${query}` : ''}`);
  },
  bulkCreate: (data) => api.post('/admin/enrollments/bulk', data),
};

export const settingsService = {
  getStats: () => api.get('/settings/stats'),
  getAbout: () => api.get('/settings/about'),
  updateAbout: (data) => api.put('/settings/about', data),
  getContact: () => api.get('/settings/contact'),
  updateContact: (data) => api.put('/settings/contact', data),
  getFounder: () => api.get('/settings/founder'),
  updateFounder: (data) => api.put('/settings/founder', data),
  getHero: () => api.get('/settings/hero'),
  updateHero: (data) => api.put('/settings/hero', data),
};
