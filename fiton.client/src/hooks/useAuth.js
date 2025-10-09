import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('jwt'),
    isAuthenticated: false, // Start as false, validate token on mount
    isLoading: true, // Start as loading to validate token
    error: null,
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        // Try to use the token to fetch user profile - this will validate it
        const response = await fetch('/api/dashboard/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Token is valid
          setAuthState({
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('jwt');
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        // Network error or other issue, assume token is invalid
        localStorage.removeItem('jwt');
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    validateToken();
  }, []);

  const setLoading = (loading) => {
    setAuthState(prev => ({ ...prev, isLoading: loading, error: null }));
  };

  const setError = (error) => {
    setAuthState(prev => ({ ...prev, error, isLoading: false }));
  };

  const setAuthData = (token) => {
    if (token) {
      localStorage.setItem('jwt', token);
      setAuthState({
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      localStorage.removeItem('jwt');
      setAuthState({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setAuthData(response.token);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      // Auto-login after registration
      await login({ email: userData.email, password: userData.password });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthData(null);
    }
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (authState.error) {
      const timer = setTimeout(() => {
        setAuthState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authState.error]);

  return {
    ...authState,
    login,
    register,
    logout,
    clearError: () => setAuthState(prev => ({ ...prev, error: null })),
  };
};