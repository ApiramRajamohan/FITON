import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMeasurements } from '../../hooks/useMeasurements';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

export const MeasurementsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate numeric fields
    const numericFields = ['height', 'weight', 'chest', 'waist', 'hips', 'shoulders', 'neckCircumference', 'sleeveLength', 'inseam', 'thigh'];
    
    numericFields.forEach(field => {
      if (formData[field] && (isNaN(Number(formData[field])) || Number(formData[field]) <= 0)) {
        errors[field] = 'Must be a positive number';
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
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Error is handled by the hook
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Body Measurements</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Messages */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              {measurements ? 'Update Your Measurements' : 'Add Your Measurements'}
            </h3>
            <p className="text-sm text-gray-600">
              Enter your body measurements to get accurate fitting recommendations. All fields are optional.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Measurements */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Measurements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    error={formErrors.height}
                    placeholder="e.g. 175"
                    step="0.1"
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    error={formErrors.weight}
                    placeholder="e.g. 70"
                    step="0.1"
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
                  <Input
                    label="Skin Color"
                    type="text"
                    name="skinColor"
                    value={formData.skinColor}
                    onChange={handleChange}
                    error={formErrors.skinColor}
                    placeholder="e.g. Fair, Medium, Dark"
                  />
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
                    onClick={() => navigate('/dashboard')}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};