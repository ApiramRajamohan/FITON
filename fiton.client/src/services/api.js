import api from '../utils/api';

// Auth Service
export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Dashboard Service
export const dashboardService = {
  async getUserProfile() {
    const response = await api.get('/dashboard/user-profile');
    return response.data;
  },
};

// Measurements Service
export const measurementsService = {
  async getMeasurements() {
    const response = await api.get('/avatar/measurements/retrieve');
    return response.data;
  },

  async saveMeasurements(measurements) {
    const response = await api.post('/avatar/measurements/save', measurements);
    return response.data;
  },

  async deleteMeasurements() {
    const response = await api.delete('/avatar/measurements/remove');
    return response.data;
  },
};

// Wardrobe Service
export const wardrobeService = {
  async getOutfits() {
    const response = await api.get('/wardrobe');
    return response.data;
  },

  async saveOutfit(outfit) {
    const response = await api.post('/wardrobe', outfit);
    return response.data;
  },

  async updateOutfit(outfitId, outfit) {
    const response = await api.put(`/wardrobe/${outfitId}`, outfit);
    return response.data;
  },

  async deleteOutfit(outfitId) {
    const response = await api.delete(`/wardrobe/${outfitId}`);
    return response.data;
  },
};