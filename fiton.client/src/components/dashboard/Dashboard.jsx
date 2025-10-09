import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { user, isLoading, error } = useUserProfile();

  // Only fetch profile if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigateToMeasurements = () => {
    navigate('/measurements');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="error" className="max-w-md">
          <h3 className="font-bold">Error loading profile</h3>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">FITON Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Profile Overview</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Username:</span>
                  <p className="text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Account Type:</span>
                  <p className="text-gray-900">{user?.isAdmin ? 'Administrator' : 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Body Measurements</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user?.measurements ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">You have measurements saved.</p>
                    {user.measurements.height && (
                      <p className="text-sm">Height: {user.measurements.height} cm</p>
                    )}
                    {user.measurements.weight && (
                      <p className="text-sm">Weight: {user.measurements.weight} kg</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No measurements saved yet.</p>
                )}
                <Button 
                  onClick={handleNavigateToMeasurements}
                  className="w-full"
                  variant="primary"
                >
                  {user?.measurements ? 'Update Measurements' : 'Add Measurements'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleNavigateToMeasurements}
                  className="w-full"
                  variant="outline"
                >
                  Manage Measurements
                </Button>
                <Button 
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  View Wardrobe (Coming Soon)
                </Button>
                <Button 
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Virtual Try-On (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Stats Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Account Statistics</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {user?.measurements ? '1' : '0'}
                  </p>
                  <p className="text-sm text-gray-600">Measurement Sets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-600">Wardrobe Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Virtual Try-Ons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};