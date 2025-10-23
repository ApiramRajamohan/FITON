import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const apiUrl = import.meta.env.VITE_API_URL;

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('jwt'),
    isAuthenticated: false, // Start as false, validate token on mount
    isLoading: true, // Start as loading to validate token
    error: null,
    user: null,
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
          user: null,
        });
        return;
      }

      try {
        // Try to use the token to fetch user profile - this will validate it
          const response = await fetch(`${apiUrl}/dashboard/user-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Token is valid
          setAuthState({
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            user: userData,
          });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('jwt');
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            user: null,
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
          user: null,
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
        user: null, // Will be populated when user profile is fetched
      });
    } else {
      localStorage.removeItem('jwt');
      setAuthState({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
      });
    }
  };

    const login = useCallback(async (email,password) => {
    setLoading(true);
      try {
          let credentials = { email, password };
      const response = await authService.login(credentials);
      setAuthData(response.token);
      
      // Fetch user profile after successful login
      try {
          const userResponse = await fetch(`${apiUrl}/dashboard/user-profile`, {
          headers: {
            'Authorization': `Bearer ${response.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setAuthState(prev => ({ ...prev, user: userData }));
        }
      } catch (userError) {
        console.error('Failed to fetch user profile:', userError);
      }
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
        await login(userData.email, userData.password);
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

  // Method to refresh user data/auth state
  const refreshAuthState = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;
    
    try {
        const response = await fetch(`${apiUrl}/dashboard/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: userData,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh auth state:', error);
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshAuthState,
    clearError: () => setAuthState(prev => ({ ...prev, error: null })),
  };
};