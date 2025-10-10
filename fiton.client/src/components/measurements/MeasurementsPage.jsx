import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMeasurements } from '../../hooks/useMeasurements';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

export const MeasurementsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, refreshAuthState } = useAuth();
  const { measurements, saveMeasurements, deleteMeasurements, isLoading, isSaving, error } = useMeasurements();
  
  const [formData, setFormData] = useState({
    height: measurements?.height || '',
    weight: measurements?.weight || '',
    chest: measurements?.chest || '',
    waist: measurements?.waist || '',
    hips: measurements?.hips || '',
    shoulders: measurements?.shoulders || '',
    neckCircumference: measurements?.neckCircumference || '',
    sleeveLength: measurements?.sleeveLength || '',
    inseam: measurements?.inseam || '',
    thigh: measurements?.thigh || '',
    skinColor: measurements?.skinColor || '',
    description: measurements?.description || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Update form when measurements load
  React.useEffect(() => {
    if (measurements) {
      setFormData({
        height: measurements.height || '',
        weight: measurements.weight || '',
        chest: measurements.chest || '',
        waist: measurements.waist || '',
        hips: measurements.hips || '',
        shoulders: measurements.shoulders || '',
        neckCircumference: measurements.neckCircumference || '',
        sleeveLength: measurements.sleeveLength || '',
        inseam: measurements.inseam || '',
        thigh: measurements.thigh || '',
        skinColor: measurements.skinColor || '',
        description: measurements.description || '',
      });
    }
  }, [measurements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const requiredFields = ['height', 'weight'];
    const numericFields = ['height', 'weight', 'chest', 'waist', 'hips', 'shoulders', 'neckCircumference', 'sleeveLength', 'inseam', 'thigh'];
    
    if (numericFields.includes(name)) {
      // Check if required field is empty
      if (requiredFields.includes(name) && (!value || value.trim() === '')) {
        setFormErrors(prev => ({ ...prev, [name]: 'This field is required' }));
      } else if (value !== '' && value !== null && value !== undefined) {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
          setFormErrors(prev => ({ ...prev, [name]: 'Must be a positive number' }));
        } else {
          // Range validation
          let error = '';
          if (name === 'height' && (numValue < 50 || numValue > 300)) {
            error = 'Height must be between 50-300 cm';
          } else if (name === 'weight' && (numValue < 20 || numValue > 500)) {
            error = 'Weight must be between 20-500 kg';
          } else if (!requiredFields.includes(name) && numValue > 200) {
            error = 'Value seems too large (max 200 cm)';
          }
          
          setFormErrors(prev => ({ ...prev, [name]: error }));
        }
      } else if (!requiredFields.includes(name)) {
        // Clear error for optional empty fields
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Define required basic measurements
    const requiredFields = ['height', 'weight'];
    const numericFields = ['height', 'weight', 'chest', 'waist', 'hips', 'shoulders', 'neckCircumference', 'sleeveLength', 'inseam', 'thigh'];
    
    // Check required fields
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || value.trim() === '') {
        errors[field] = 'This field is required';
        return;
      }
      
      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) {
        errors[field] = 'Must be a positive number';
      } else {
        // Additional range validation
        if (field === 'height' && (numValue < 50 || numValue > 300)) {
          errors[field] = 'Height must be between 50-300 cm';
        } else if (field === 'weight' && (numValue < 20 || numValue > 500)) {
          errors[field] = 'Weight must be between 20-500 kg';
        }
      }
    });
    
    // Validate optional numeric fields
    numericFields.forEach(field => {
      if (requiredFields.includes(field)) return; // Already validated above
      
      const value = formData[field];
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
          errors[field] = 'Must be a positive number';
        } else {
          // Range validation for optional fields
          if (numValue > 200) {
            errors[field] = 'Value seems too large (max 200 cm)';
          }
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Convert values to strings as expected by the backend
      const measurementData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          measurementData[key] = null;
        } else {
          // Send all values as strings since backend expects strings
          measurementData[key] = formData[key].toString();
        }
      });

      await saveMeasurements(measurementData);
      setSuccessMessage('Measurements saved successfully!');
      
      // Refresh auth state to ensure user data is up to date
      await refreshAuthState();
      
      // If user came from Virtual Try-On, navigate back there after a brief delay
      if (location.state?.from === '/virtual-try-on') {
        setTimeout(() => {
          navigate('/virtual-try-on', { state: { from: '/measurements' } });
        }, 1500);
      } else {
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
    } catch (error) {
      console.error('Save measurements error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        setFormErrors({ general: 'Your session has expired. Please log in again.' });
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete all your measurements? This action cannot be undone.')) {
      try {
        await deleteMeasurements();
        setFormData({
          height: '',
          weight: '',
          chest: '',
          waist: '',
          hips: '',
          shoulders: '',
          neckCircumference: '',
          sleeveLength: '',
          inseam: '',
          thigh: '',
          skinColor: '',
          description: '',
        });
        setSuccessMessage('Measurements deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleNavigateToDashboard = async () => {
    // Check if token is still valid before navigating
    const token = localStorage.getItem('jwt');
    if (!token) {
      //await logout();
      navigate('/dashboard');
      return;
    }
    
    try {
      // Test the token by making a quick API call
      const response = await fetch('http://localhost:5230/api/dashboard/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        navigate('/dashboard');
      } else {
        // Token is invalid
       // await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Token validation error:', error);
     //await logout();
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Body Measurements</h1>
            {location.state?.from === '/virtual-try-on' ? (
              <Button 
                variant="outline" 
                onClick={() => navigate('/virtual-try-on', { state: { from: '/measurements' } })}
              >
                Back to Virtual Try-On
              </Button>
            ) : (
              <Button variant="outline" onClick={handleNavigateToDashboard}>
                Back to Dashboard
              </Button>
            )}
          </div>
          <p className="text-gray-600 mt-2">Track your body measurements for better fitness monitoring.</p>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}
        
        {formErrors.general && (
          <Alert variant="error" className="mb-6">
            {formErrors.general}
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {measurements ? 'Update Your Measurements' : 'Add Your Measurements'}
            </h3>
            <p className="text-sm text-gray-600">
              Enter your body measurements to get accurate fitting recommendations. <span className="text-red-600 font-medium">Height and Weight are required.</span> Other fields are optional.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Measurements */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Measurements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Height (cm) *"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    error={formErrors.height}
                    placeholder="e.g. 175"
                    step="0.1"
                    required
                  />
                  <Input
                    label="Weight (kg) *"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    error={formErrors.weight}
                    placeholder="e.g. 70"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Body Measurements */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Body Measurements (cm)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Chest"
                    type="number"
                    name="chest"
                    value={formData.chest}
                    onChange={handleChange}
                    error={formErrors.chest}
                    placeholder="e.g. 100"
                    step="0.1"
                  />
                  <Input
                    label="Waist"
                    type="number"
                    name="waist"
                    value={formData.waist}
                    onChange={handleChange}
                    error={formErrors.waist}
                    placeholder="e.g. 85"
                    step="0.1"
                  />
                  <Input
                    label="Hips"
                    type="number"
                    name="hips"
                    value={formData.hips}
                    onChange={handleChange}
                    error={formErrors.hips}
                    placeholder="e.g. 95"
                    step="0.1"
                  />
                  <Input
                    label="Shoulders"
                    type="number"
                    name="shoulders"
                    value={formData.shoulders}
                    onChange={handleChange}
                    error={formErrors.shoulders}
                    placeholder="e.g. 45"
                    step="0.1"
                  />
                  <Input
                    label="Neck Circumference"
                    type="number"
                    name="neckCircumference"
                    value={formData.neckCircumference}
                    onChange={handleChange}
                    error={formErrors.neckCircumference}
                    placeholder="e.g. 38"
                    step="0.1"
                  />
                  <Input
                    label="Sleeve Length"
                    type="number"
                    name="sleeveLength"
                    value={formData.sleeveLength}
                    onChange={handleChange}
                    error={formErrors.sleeveLength}
                    placeholder="e.g. 65"
                    step="0.1"
                  />
                  <Input
                    label="Inseam"
                    type="number"
                    name="inseam"
                    value={formData.inseam}
                    onChange={handleChange}
                    error={formErrors.inseam}
                    placeholder="e.g. 80"
                    step="0.1"
                  />
                  <Input
                    label="Thigh"
                    type="number"
                    name="thigh"
                    value={formData.thigh}
                    onChange={handleChange}
                    error={formErrors.thigh}
                    placeholder="e.g. 55"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skin Color
                    </label>
                    <select
                      name="skinColor"
                      value={formData.skinColor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select skin tone</option>
                      <option value="Very Fair">Very Fair</option>
                      <option value="Fair">Fair</option>
                      <option value="Light">Light</option>
                      <option value="Light Medium">Light Medium</option>
                      <option value="Medium">Medium</option>
                      <option value="Medium Dark">Medium Dark</option>
                      <option value="Dark">Dark</option>
                      <option value="Very Dark">Very Dark</option>
                      <option value="Deep">Deep</option>
                    </select>
                    {formErrors.skinColor && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.skinColor}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes about your measurements or preferences..."
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                <div className="flex gap-2">
                  {measurements && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDelete}
                      disabled={isSaving}
                    >
                      Delete All Measurements
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNavigateToDashboard}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    {measurements ? 'Update Measurements' : 'Save Measurements'}
                  </Button>
                </div>
              </div>
            </form>
        </Card>
      </div>
    </div>
  );
};

export default MeasurementsPage;