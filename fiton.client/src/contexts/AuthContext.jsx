import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper to normalize API payload casing
const toUser = (data) => ({
    Id: data?.Id ?? data?.id ?? null,
    Username: data?.Username ?? data?.username ?? null,
    Email: data?.Email ?? data?.email ?? null,
    IsAdmin: data?.IsAdmin ?? data?.isAdmin ?? false,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check if user is logged in on app start (verify token by calling /me)
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get('/api/auth/me');
                    setUser(toUser(response.data));
                } catch (error) {
                    const status = error?.response?.status;
                    console.warn('Auth check failed', status);
                    // Any failure -> treat token as invalid to prevent protected route bypass
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { email, password });

            const tokenValue = response.data?.Token ?? response.data?.token;
            if (tokenValue) {
                setToken(tokenValue);
                localStorage.setItem('token', tokenValue);
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
            }

            setUser(toUser(response.data));
            return { success: true };
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.Error || error.response?.data?.message || error.response?.data || 'Login failed';
            if (status === 401) {
                // Ensure any stale token is removed so UI doesn't redirect
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                setToken(null);
                setUser(null);
            }
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        setLoading(true);
        try {
            await axios.post('/api/auth/register', { username, email, password });
            // Intentionally do NOT auto-login new user. Force manual login.
            return { success: true, requiresLogin: true };
        } catch (error) {
            const message = error.response?.data?.Error || error.response?.data?.message || error.response?.data || 'Registration failed';
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const adminLogin = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/admin-login', { email, password });

            const tokenValue = response.data?.Token ?? response.data?.token;
            if (tokenValue) {
                setToken(tokenValue);
                localStorage.setItem('token', tokenValue);
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
            }

            setUser(toUser(response.data));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.Error || error.response?.data?.message || error.response?.data || 'Admin login failed';
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const value = {
        user,
        login,
        register,
        adminLogin,
        logout,
        loading,
    isAuthenticated: !!user && !!token,
        isAdmin: user?.IsAdmin || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
