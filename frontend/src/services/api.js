/**
 * Full-Stack MERN API Client (frontend/src/services/api.js)
 * Connects the React Frontend to the Node.js / Express / Mongoose REST API.
 * Uses relative '/api' & '/uploads' URLs in development (proxied by Vite) and single-host production,
 * or prefixes VITE_API_URL when frontend and backend are hosted on separate domains.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_STORAGE_KEY = 'jp_admin_jwt_v1';

export function getAdminToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function resolveMediaUrl(src) {
  if (!src) return '/images/p1.jpg';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }
  if (src.startsWith('/uploads/') && API_BASE_URL) {
    return `${API_BASE_URL}${src}`;
  }
  return src;
}

function normalizeProductMedia(product) {
  if (!product) return product;
  return {
    ...product,
    photos: (product.photos || ['/images/p1.jpg']).map(resolveMediaUrl),
  };
}

function normalizeOrderMedia(order) {
  if (!order) return order;
  return {
    ...order,
    items: (order.items || []).map((item) => ({
      ...item,
      photo: resolveMediaUrl(item.photo),
    })),
  };
}

async function request(endpoint, options = {}) {
  const token = getAdminToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Erreur de communication avec le serveur.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export const boutiqueApi = {
  // Health check
  async checkHealth() {
    return request('/api/health');
  },

  // Public bootstrap
  async getPublicProducts() {
    const list = await request('/api/products');
    return list.map(normalizeProductMedia);
  },

  async getSettings() {
    return request('/api/settings');
  },

  // Auth
  async loginAdmin(password) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (res.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  async verifyAdminSession() {
    return request('/api/auth/verify');
  },

  async updateAdminPassword(newPassword) {
    return request('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },

  logoutAdmin() {
    setAdminToken('');
  },

  // Admin Products CRUD & Photo Upload
  async getAdminProducts() {
    const list = await request('/api/products/admin');
    return list.map(normalizeProductMedia);
  },

  async uploadPhotos(fileList) {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('photos', file);
    });
    const res = await request('/api/upload', {
      method: 'POST',
      body: formData,
    });
    return (res.urls || []).map(resolveMediaUrl);
  },

  async createProduct(productPayload) {
    const created = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productPayload),
    });
    return normalizeProductMedia(created);
  },

  async updateProduct(id, updates) {
    const updated = await request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return normalizeProductMedia(updated);
  },

  async toggleProductVisibility(id) {
    const updated = await request(`/api/products/${id}/visibility`, {
      method: 'PATCH',
    });
    return normalizeProductMedia(updated);
  },

  async deleteProduct(id) {
    return request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders (Public & Admin)
  async createOrder(orderPayload) {
    const created = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return normalizeOrderMedia(created);
  },

  async getOrderByReference(reference) {
    const order = await request(`/api/orders/ref/${encodeURIComponent(reference)}`);
    return normalizeOrderMedia(order);
  },

  async getAdminOrders() {
    const list = await request('/api/orders');
    return list.map(normalizeOrderMedia);
  },

  async updateOrderStatus(id, status) {
    const updated = await request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return normalizeOrderMedia(updated);
  },

  async deleteOrder(id) {
    return request(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Boutique Settings & Backup
  async updateSettings(nextSettings) {
    return request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(nextSettings),
    });
  },

  async getFullBackup() {
    return request('/api/settings/backup');
  },
};
