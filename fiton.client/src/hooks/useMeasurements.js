import { useState, useEffect, useCallback } from 'react';
import { measurementsService } from '../services/api';

export const useMeasurements = () => {
  const [state, setState] = useState({
    measurements: null,
    isLoading: false,
    error: null,
    isSaving: false,
  });

  const fetchMeasurements = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const measurements = await measurementsService.getMeasurements();
      setState(prev => ({ ...prev, measurements, isLoading: false }));
    } catch (error) {
      if (error.response?.status === 404) {
        // No measurements found - this is okay
        setState(prev => ({ ...prev, measurements: null, isLoading: false }));
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to fetch measurements';
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      }
    }
  }, []);

  const saveMeasurements = useCallback(async (data) => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    try {
      const savedMeasurements = await measurementsService.saveMeasurements(data);
      setState(prev => ({ ...prev, measurements: savedMeasurements, isSaving: false }));
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save measurements';
      setState(prev => ({ ...prev, error: errorMessage, isSaving: false }));
      throw error;
    }
  }, []);

  const deleteMeasurements = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await measurementsService.deleteMeasurements();
      setState(prev => ({ ...prev, measurements: null, isLoading: false }));
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete measurements';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  return {
    ...state,
    saveMeasurements,
    deleteMeasurements,
    refetch: fetchMeasurements,
  };
};