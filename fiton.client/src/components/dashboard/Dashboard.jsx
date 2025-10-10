import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { 
  UserIcon, 
  MeasurementIcon, 
  WardrobeIcon, 
  TryOnIcon, 
  StatsIcon, 
  SparklesIcon,
  ArrowRightIcon,
  EditIcon,
  PlusIcon,
  HeartIcon
} from '../ui/Icons';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuthState } = useAuth();
  const { user, isLoading, error, refetch } = useUserProfile();
  const { outfits } = useWardrobe();

  // Only fetch profile if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Refresh profile data when component mounts (helpful when returning from measurements page)
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh both auth state and user profile
      refreshAuthState();
      refetch();
    }
  }, [isAuthenticated, refetch, refreshAuthState]);

  const handleNavigateToMeasurements = () => {
    navigate('/measurements');
  };

  const handleNavigateToWardrobe = () => {
    navigate('/wardrobe');
  };

  const handleRetryProfile = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md space-y-6">
          <Alert variant="error">
            <h3 className="font-bold">Error loading profile</h3>
            <p>{error}</p>
          </Alert>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetryProfile} variant="primary">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card variant="gradient" className="overflow-hidden">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome to your style journey, {user?.username}! ✨
                  </h2>
                  <p className="text-white/90 text-lg max-w-2xl">
                    Track your measurements, build your wardrobe, and discover your perfect fit with AI-powered recommendations.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <HeartIcon size="2xl" className="text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <MeasurementIcon size="lg" className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600">
                {user?.measurements ? '1' : '0'}
              </h3>
              <p className="text-gray-600 font-medium">Measurement Sets</p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-4">
                <WardrobeIcon size="lg" className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-600">{outfits?.length || 0}</h3>
              <p className="text-gray-600 font-medium">Wardrobe Items</p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <TryOnIcon size="lg" className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600">0</h3>
              <p className="text-gray-600 font-medium">Virtual Try-Ons</p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                <SparklesIcon size="lg" className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-600">0</h3>
              <p className="text-gray-600 font-medium">Style Matches</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon size="md" className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Profile Overview</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Username</span>
                    <span className="font-semibold text-gray-900">{user?.username}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Email</span>
                    <span className="font-semibold text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Account Type</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user?.isAdmin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Measurements Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <MeasurementIcon size="md" className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Body Measurements</h3>
                      <p className="text-sm text-gray-600">Track your measurements for perfect fit</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {user?.measurements ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {user.measurements.height && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm font-medium text-emerald-800">Height</p>
                          <p className="text-2xl font-bold text-emerald-900">{user.measurements.height} cm</p>
                        </div>
                      )}
                      {user.measurements.weight && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm font-medium text-emerald-800">Weight</p>
                          <p className="text-2xl font-bold text-emerald-900">{user.measurements.weight} kg</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleNavigateToMeasurements}
                      variant="outline"
                      className="w-full"
                    >
                      <EditIcon size="sm" className="mr-2" />
                      Update Measurements
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <MeasurementIcon size="xl" className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No measurements yet</h4>
                    <p className="text-gray-600 mb-6">Add your measurements to get started with personalized recommendations</p>
                    <Button 
                      onClick={handleNavigateToMeasurements}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <PlusIcon size="sm" className="mr-2" />
                      Add Your First Measurements
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <SparklesIcon size="md" className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-600">Explore FITON's features</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleNavigateToMeasurements}
                    variant="outline"
                    className="flex items-center justify-between p-4 h-auto"
                  >
                    <div className="flex items-center">
                      <MeasurementIcon size="md" className="mr-3 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold">Measurements</p>
                        <p className="text-sm text-gray-600">Manage your body data</p>
                      </div>
                    </div>
                    <ArrowRightIcon size="sm" />
                  </Button>

                  <Button 
                    onClick={handleNavigateToWardrobe}
                    variant="outline"
                    className="flex items-center justify-between p-4 h-auto"
                  >
                    <div className="flex items-center">
                      <WardrobeIcon size="md" className="mr-3 text-emerald-600" />
                      <div className="text-left">
                        <p className="font-semibold">Wardrobe {outfits?.length > 0 && `(${outfits.length})`}</p>
                        <p className="text-sm text-gray-600">Browse your outfits</p>
                      </div>
                    </div>
                    <ArrowRightIcon size="sm" />
                  </Button>

                  <Button 
                    variant="outline"
                    disabled
                    className="flex items-center justify-between p-4 h-auto opacity-60"
                  >
                    <div className="flex items-center">
                      <TryOnIcon size="md" className="mr-3 text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold">Virtual Try-On</p>
                        <p className="text-sm text-gray-600">Coming Soon</p>
                      </div>
                    </div>
                    <ArrowRightIcon size="sm" />
                  </Button>

                  <Button 
                    variant="outline"
                    disabled
                    className="flex items-center justify-between p-4 h-auto opacity-60"
                  >
                    <div className="flex items-center">
                      <StatsIcon size="md" className="mr-3 text-orange-600" />
                      <div className="text-left">
                        <p className="font-semibold">Style Analytics</p>
                        <p className="text-sm text-gray-600">Coming Soon</p>
                      </div>
                    </div>
                    <ArrowRightIcon size="sm" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
};