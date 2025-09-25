import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = '/';

// API endpoints for measurements
export const measurementAPI = {
    getMeasurements: async () => {
        const response = await axios.get('/api/avatar/measurements');
        return response.data;
    },

    saveMeasurements: async (measurements) => {
        const response = await axios.post('/api/avatar/measurements', measurements);
        return response.data;
    },

    deleteMeasurements: async () => {
        const response = await axios.delete('/api/avatar/measurements');
        return response.data;
    }
};

// API endpoints for dashboard
export const dashboardAPI = {
    getUserProfile: async () => {
        const response = await axios.get('/api/dashboard/user-profile');
        return response.data;
    },

    getUserStats: async () => {
        const response = await axios.get('/api/dashboard/stats');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await axios.get('/api/dashboard/admin/users');
        return response.data;
    }
};

// Generic API error handler
export const handleAPIError = (error) => {
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || error.response.data || 'Server error occurred';
    } else if (error.request) {
        // Request made but no response received
        return 'No response from server. Please check your connection.';
    } else {
        // Something else happened
        return error.message || 'An unexpected error occurred';
    }
};
