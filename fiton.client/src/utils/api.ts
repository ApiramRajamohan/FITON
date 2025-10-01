// src/utils/api.ts
import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

// Set initial token if exists
const token = localStorage.getItem("jwt");
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwt");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't intercept if it's not a 401, already retried, or auth endpoint
        if (error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url?.includes('/auth/')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            console.log("🔄 Attempting to refresh token...");

            // Create a new axios instance without interceptors for the refresh request
            const refreshAxios = axios.create({
                baseURL: '/api',
                withCredentials: true
            });

            const refreshResponse = await refreshAxios.post('/auth/refresh', {});

            console.log("✅ Refresh response:", refreshResponse.data);

            if (!refreshResponse.data.token) {
                throw new Error("No token in refresh response");
            }

            const newToken = refreshResponse.data.token;
            console.log("✅ New token received");

            // Update stored token and axios defaults
            localStorage.setItem("jwt", newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            processQueue(null, newToken);
            return api(originalRequest);

        } catch (refreshError: any) {
            console.log("❌ Token refresh failed:", refreshError);
            console.log("Refresh error details:", {
                status: refreshError.response?.status,
                data: refreshError.response?.data,
                message: refreshError.message
            });

            processQueue(refreshError, null);

            // Clear auth state
            localStorage.removeItem("jwt");
            delete api.defaults.headers.common['Authorization'];

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/signin')) {
                window.location.href = '/signin';
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;