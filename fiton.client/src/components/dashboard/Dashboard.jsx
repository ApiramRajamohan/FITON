import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useClothes } from '../../hooks/useClothes';
import { useWardrobe } from '../../hooks/useWardrobe';
import { addSampleClothesData } from '../../utils/sampleData';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { 
  UserIcon, 
  MeasurementIcon, 
  ClothesIcon, 
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
  const { outfits, fetchOutfits } = useClothes();
  const { wardrobes } = useWardrobe();
  const [sampleDataLoading, setSampleDataLoading] = useState(false);
  const [sampleDataMessage, setSampleDataMessage] = useState('');

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

  const handleNavigateToClothes = () => {
    navigate('/clothes');
  };

  const handleNavigateToWardrobe = () => {
    navigate('/wardrobe');
  };

  const handleNavigateToVirtualTryOn = () => {
    navigate('/virtual-try-on');
  };

  const handleAddSampleData = async () => {
    try {
      setSampleDataLoading(true);
      setSampleDataMessage('');
      
      const result = await addSampleClothesData();
      setSampleDataMessage(`✅ ${result.message} Added ${result.count} items.`);
      
      // Refresh the clothes data
      if (fetchOutfits) {
        await fetchOutfits();
      }
    } catch (error) {
      setSampleDataMessage(`❌ ${error.message}`);
    } finally {
      setSampleDataLoading(false);
    }
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
                    Track your measurements, build your clothes collection, and discover your perfect fit with AI-powered recommendations.
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

        {/* Temporary Sample Data Section */}
        {(!outfits || outfits.length === 0) && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="py-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🎯 Get Started with Sample Data
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add sample clothes to test the wardrobe feature and see how outfit combinations work
                  </p>
                  {sampleDataMessage && (
                    <div className="mb-4 p-3 bg-white rounded-lg border">
                      <p className="text-sm">{sampleDataMessage}</p>
                    </div>
                  )}
                  <Button
                    onClick={handleAddSampleData}
                    disabled={sampleDataLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {sampleDataLoading ? (
                      <><Spinner size="sm" className="mr-2" /> Adding Sample Data...</>
                    ) : (
                      'Add Sample Clothes'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-4">
                <ClothesIcon size="lg" className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-600">{outfits?.length || 0}</h3>
              <p className="text-gray-600 font-medium">Clothing Items</p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <WardrobeIcon size="lg" className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600">{wardrobes?.length || 0}</h3>
              <p className="text-gray-600 font-medium">Complete Outfits</p>
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

        {/* Quick Actions */}
        <div className="mb-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  onClick={handleNavigateToClothes}
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto"
                >
                  <div className="flex items-center">
                    <ClothesIcon size="md" className="mr-3 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-semibold">Clothes {outfits?.length > 0 && `(${outfits.length})`}</p>
                      <p className="text-sm text-gray-600">Browse your clothes</p>
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
                    <WardrobeIcon size="md" className="mr-3 text-orange-600" />
                    <div className="text-left">
                      <p className="font-semibold">Wardrobe {wardrobes?.length > 0 && `(${wardrobes.length})`}</p>
                      <p className="text-sm text-gray-600">Complete outfits</p>
                    </div>
                  </div>
                  <ArrowRightIcon size="sm" />
                </Button>

                <Button 
                  onClick={handleNavigateToVirtualTryOn}
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto"
                >
                  <div className="flex items-center">
                    <TryOnIcon size="md" className="mr-3 text-purple-600" />
                    <div className="text-left">
                      <p className="font-semibold">Virtual Try-On</p>
                      <p className="text-sm text-gray-600">Create 3D avatar</p>
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

        {/* Profile Overview Section */}
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserIcon size="md" className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Profile Overview</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
};