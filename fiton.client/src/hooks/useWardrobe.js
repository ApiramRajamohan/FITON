import { useState, useEffect, useCallback } from 'react';
import { wardrobeService } from '../services/api';

export const useWardrobe = () => {
  const [state, setState] = useState({
    outfits: [],
    isLoading: false,
    error: null,
    isSaving: false,
  });

  const fetchOutfits = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const outfits = await wardrobeService.getOutfits();
      setState(prev => ({ ...prev, outfits, isLoading: false }));
    } catch (error) {
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        // Token might have expired, redirect to login
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = error.response?.data?.error || 'Failed to fetch outfits';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, []);

  const saveOutfit = async (outfitData) => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    try {
      const response = await wardrobeService.saveOutfit(outfitData);
      // The backend returns the outfit directly, not wrapped in an object
      setState(prev => ({ 
        ...prev, 
        outfits: [...prev.outfits, response],
        isSaving: false 
      }));
      
      // Force a small delay to ensure token is properly updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return response;
    } catch (error) {
      console.error('Save outfit error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        // Token might have expired, redirect to login
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to save outfit';
      setState(prev => ({ ...prev, error: errorMessage, isSaving: false }));
      throw error;
    }
  };

  const updateOutfit = async (outfitId, outfitData) => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    try {
      const response = await wardrobeService.updateOutfit(outfitId, outfitData);
      // Update the outfit in the state
      setState(prev => ({ 
        ...prev, 
        outfits: prev.outfits.map(outfit => 
          outfit.id === outfitId ? response : outfit
        ),
        isSaving: false 
      }));
      
      // Force a small delay to ensure token is properly updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return response;
    } catch (error) {
      console.error('Update outfit error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        // Token might have expired, redirect to login
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to update outfit';
      setState(prev => ({ ...prev, error: errorMessage, isSaving: false }));
      throw error;
    }
  };

  const deleteOutfit = useCallback(async (outfitId) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await wardrobeService.deleteOutfit(outfitId);
      setState(prev => ({ 
        ...prev, 
        outfits: prev.outfits.filter(outfit => outfit.id !== outfitId), 
        isLoading: false 
      }));
    } catch (error) {
      console.error('Delete outfit error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        // Token might have expired, redirect to login
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = error.response?.data?.error || 'Failed to delete outfit';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  return {
    ...state,
    saveOutfit,
    updateOutfit,
    deleteOutfit,
    refetch: fetchOutfits,
  };
};