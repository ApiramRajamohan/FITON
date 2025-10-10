import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

const VirtualTryOnPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Avatar creation form state
  const [avatarForm, setAvatarForm] = useState({
    name: '',
    skinTone: 'medium',
    hairColor: 'brown',
    eyeColor: 'brown'
  });

  useEffect(() => {
    checkMeasurementsAndLoadAvatars();
  }, []);

  // Re-check measurements when navigating back to this page
  useEffect(() => {
    if (location.state?.from === '/measurements') {
      // User came from measurements page, refresh data
      setLoading(true);
      checkMeasurementsAndLoadAvatars();
    }
  }, [location]);

  // Re-check measurements when page gains focus (user might have navigated back from measurements page)
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        checkMeasurementsAndLoadAvatars();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    return () => document.removeEventListener('visibilitychange', handleFocus);
  }, []);

  const checkMeasurementsAndLoadAvatars = async () => {
    try {
      const token = localStorage.getItem('jwt'); // Fixed: use 'jwt' instead of 'authToken'
      console.log('🔍 Checking measurements with token:', token ? 'Token exists' : 'No token');
      
      // Check if user has measurements
      const measurementResponse = await fetch('/api/avatar/check-measurements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Measurement response status:', measurementResponse.status);
      
      if (!measurementResponse.ok) {
        const errorText = await measurementResponse.text();
        console.error('❌ Measurement check failed:', errorText);
        throw new Error('Failed to check measurements');
      }
      
      const measurementData = await measurementResponse.json();
      console.log('✅ Measurement check result:', measurementData);
      setHasMeasurements(measurementData.hasMeasurements);
      
      if (measurementData.hasMeasurements) {
        console.log('👤 User has measurements, loading avatars...');
        // Load user's avatars
        const avatarResponse = await fetch('/api/avatar', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Avatar response status:', avatarResponse.status);
        
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          console.log('✅ Avatar data:', avatarData);
          setAvatars(avatarData.data || []);
        } else {
          const errorText = await avatarResponse.text();
          console.error('❌ Avatar fetch failed:', errorText);
        }
      } else {
        console.log('❌ User does not have measurements');
      }
    } catch (error) {
      console.error('💥 Error checking measurements:', error);
      setError('Failed to load avatar information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAvatar = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('jwt'); // Fixed: use 'jwt'
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(avatarForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Avatar created successfully!');
        setShowCreateForm(false);
        setAvatarForm({
          name: '',
          skinTone: 'medium',
          hairColor: 'brown',
          eyeColor: 'brown'
        });
        // Reload avatars
        checkMeasurementsAndLoadAvatars();
      } else {
        setError(data.message || 'Failed to create avatar');
      }
    } catch (error) {
      console.error('Error creating avatar:', error);
      setError('Failed to create avatar');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleGenerate3D = async (avatarId) => {
    try {
      const token = localStorage.getItem('jwt'); // Fixed: use 'jwt'
      const response = await fetch(`/api/avatar/${avatarId}/generate-3d`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modelType: 'Standard',
          quality: 'High'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('3D model generated successfully!');
        checkMeasurementsAndLoadAvatars(); // Reload to get updated status
      } else {
        setError(data.message || 'Failed to generate 3D model');
      }
    } catch (error) {
      console.error('Error generating 3D model:', error);
      setError('Failed to generate 3D model');
    }
  };

  const handleDeleteAvatar = async (avatarId) => {
    if (!confirm('Are you sure you want to delete this avatar?')) return;

    try {
      const token = localStorage.getItem('jwt'); // Fixed: use 'jwt'
      const response = await fetch(`/api/avatar/${avatarId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Avatar deleted successfully!');
        checkMeasurementsAndLoadAvatars(); // Reload avatars
      } else {
        setError('Failed to delete avatar');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setError('Failed to delete avatar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasMeasurements) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Virtual Try-On</h1>
          
          <Card className="max-w-md mx-auto">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Measurements Required</h3>
              <p className="text-gray-600 mb-6">
                To create your virtual avatar, please add your body measurements first.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/measurements', { state: { from: '/virtual-try-on' } })} 
                  className="w-full"
                >
                  Add Measurements
                </Button>
                <Button 
                  onClick={() => {
                    setLoading(true);
                    checkMeasurementsAndLoadAvatars();
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Check Again'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
        <p className="text-gray-600 mt-2">Create and manage your 3D avatars for virtual try-on experience</p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Show Generate Avatar CTA when user has measurements but no avatars */}
      {hasMeasurements && avatars.length === 0 && !showCreateForm && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Create Your Avatar!</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Great! You have measurements on file. Now you can create your personalized 3D avatar for virtual try-on.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Generate Avatar
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Creation/Management Panel */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Avatars</h2>
              
              {/* Show Create New Avatar button only if user already has avatars or form is not shown */}
              {avatars.length > 0 && !showCreateForm && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mb-4"
                >
                  Create New Avatar
                </Button>
              )}

              {showCreateForm && (
                <form onSubmit={handleCreateAvatar} className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Create Avatar</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Avatar Name
                      </label>
                      <input
                        type="text"
                        value={avatarForm.name}
                        onChange={(e) => setAvatarForm({...avatarForm, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="My Avatar"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skin Tone
                      </label>
                      <select
                        value={avatarForm.skinTone}
                        onChange={(e) => setAvatarForm({...avatarForm, skinTone: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="tan">Tan</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hair Color
                      </label>
                      <select
                        value={avatarForm.hairColor}
                        onChange={(e) => setAvatarForm({...avatarForm, hairColor: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="black">Black</option>
                        <option value="brown">Brown</option>
                        <option value="blonde">Blonde</option>
                        <option value="red">Red</option>
                        <option value="gray">Gray</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eye Color
                      </label>
                      <select
                        value={avatarForm.eyeColor}
                        onChange={(e) => setAvatarForm({...avatarForm, eyeColor: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="brown">Brown</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="gray">Gray</option>
                        <option value="hazel">Hazel</option>
                      </select>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={createLoading}
                        className="flex-1"
                      >
                        {createLoading ? <Spinner size="sm" /> : 'Create Avatar'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Avatar List */}
              <div className="space-y-3">
                {avatars.length === 0 && !showCreateForm ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Click "Generate Avatar" above to create your first avatar
                    </p>
                  </div>
                ) : avatars.length === 0 ? null : (
                  avatars.map((avatar) => (
                    <div key={avatar.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{avatar.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          avatar.isGenerated 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {avatar.generationStatus}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Skin: {avatar.skinTone}</p>
                        <p>Hair: {avatar.hairColor}</p>
                        <p>Eyes: {avatar.eyeColor}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedAvatar(avatar)}
                          className="flex-1"
                        >
                          Select
                        </Button>
                        
                        {!avatar.isGenerated && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleGenerate3D(avatar.id)}
                          >
                            Generate 3D
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteAvatar(avatar.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Virtual Try-On Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Virtual Try-On Viewer</h2>
              
              {selectedAvatar ? (
                <div>
                  <div className="bg-gray-100 rounded-lg p-8 text-center mb-6" style={{minHeight: '400px'}}>
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {selectedAvatar.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {selectedAvatar.isGenerated 
                            ? '3D Avatar Ready for Try-On' 
                            : 'Generate 3D model to begin virtual try-on'
                          }
                        </p>
                        
                        {selectedAvatar.isGenerated ? (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500">
                              3D model viewer will be implemented here
                            </p>
                            <div className="flex justify-center space-x-2">
                              <Button size="sm">Try On Outfits</Button>
                              <Button size="sm" variant="secondary">View 360°</Button>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => handleGenerate3D(selectedAvatar.id)}>
                            Generate 3D Model
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Avatar Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Height</p>
                      <p className="font-medium">{selectedAvatar.height || 'N/A'} cm</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Weight</p>
                      <p className="font-medium">{selectedAvatar.weight || 'N/A'} kg</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Chest</p>
                      <p className="font-medium">{selectedAvatar.chest || 'N/A'} cm</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Waist</p>
                      <p className="font-medium">{selectedAvatar.waist || 'N/A'} cm</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center" style={{minHeight: '400px'}}>
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      {avatars.length === 0 ? (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Avatar</h3>
                          <p className="text-gray-600">
                            Click "Generate Avatar" to create your first 3D avatar
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Avatar</h3>
                          <p className="text-gray-600">
                            Choose an avatar from the left panel to start your virtual try-on experience
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnPage;