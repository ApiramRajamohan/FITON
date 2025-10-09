import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/api';

export const useUserProfile = (autoFetch = true) => {
  const [state, setState] = useState({
    user: null,
    isLoading: false,
    error: null,
  });

  const fetchUserProfile = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await dashboardService.getUserProfile();
      setState({ user, isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch user profile';
      setState({ user: null, isLoading: false, error: errorMessage });
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, autoFetch]);

  return {
    ...state,
    refetch: fetchUserProfile,
  };
};