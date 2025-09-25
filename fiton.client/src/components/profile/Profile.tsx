import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowLeft, User, Mail, Calendar, Ruler, Shirt } from 'lucide-react';

interface Measurements {
  chest: string;
  waist: string;
  hips: string;
  shoulders: string;
  inseam: string;
  height: string;
  weight: string;
  neckCircumference: string;
  sleeveLength: string;
  thigh: string;
}

interface UserProfile {
  username: string;
  email: string;
  fullName: string;
  bio: string;
  joinDate: string;
  measurements?: Measurements;
}

interface ProfileProps {
  username: string;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBackToDashboard: () => void;
  onSignOut: () => void;
  onNavigateToMeasurements: () => void;
}

export function Profile({ username, userProfile, onUpdateProfile, onBackToDashboard, onSignOut, onNavigateToMeasurements }: ProfileProps) {
  const [profileData, setProfileData] = useState(userProfile || {
    username: username,
    email: `${username}@example.com`,
    fullName: username.charAt(0).toUpperCase() + username.slice(1),
    bio: 'Fashion enthusiast and style lover',
    joinDate: 'January 2024'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    onUpdateProfile(profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackToDashboard}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-white p-2 rounded-lg">
              <Shirt className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-foreground">Profile</h1>
          </div>
          <Button 
            onClick={onSignOut}
            variant="ghost"
            className="text-foreground hover:bg-muted hover:text-foreground"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gray-700 text-white text-2xl">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-white">{profileData.fullName}</CardTitle>
                  <CardDescription className="text-gray-300">
                    @{profileData.username}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Full Name</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  ) : (
                    <p className="text-gray-300 p-2">{profileData.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  ) : (
                    <p className="text-gray-300 p-2">{profileData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  ) : (
                    <p className="text-gray-300 p-2">@{profileData.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member Since</span>
                  </Label>
                  <p className="text-gray-300 p-2">{profileData.joinDate}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                {isEditing ? (
                  <Input
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ) : (
                  <p className="text-gray-300 p-2">{profileData.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      className="text-white hover:bg-gray-800 hover:text-white border border-gray-600"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Body Measurements Section */}
              <Card className="bg-gray-800 border-gray-600 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Ruler className="w-5 h-5" />
                    <span>Body Measurements</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Track your measurements for better fitting clothes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileData.measurements ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {profileData.measurements.height && (
                          <div className="text-center">
                            <p className="text-gray-400">Height</p>
                            <p className="text-white">{profileData.measurements.height} cm</p>
                          </div>
                        )}
                        {profileData.measurements.weight && (
                          <div className="text-center">
                            <p className="text-gray-400">Weight</p>
                            <p className="text-white">{profileData.measurements.weight} kg</p>
                          </div>
                        )}
                        {profileData.measurements.chest && (
                          <div className="text-center">
                            <p className="text-gray-400">Chest</p>
                            <p className="text-white">{profileData.measurements.chest} cm</p>
                          </div>
                        )}
                        {profileData.measurements.waist && (
                          <div className="text-center">
                            <p className="text-gray-400">Waist</p>
                            <p className="text-white">{profileData.measurements.waist} cm</p>
                          </div>
                        )}
                        {profileData.measurements.hips && (
                          <div className="text-center">
                            <p className="text-gray-400">Hips</p>
                            <p className="text-white">{profileData.measurements.hips} cm</p>
                          </div>
                        )}
                        {profileData.measurements.inseam && (
                          <div className="text-center">
                            <p className="text-gray-400">Inseam</p>
                            <p className="text-white">{profileData.measurements.inseam} cm</p>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={onNavigateToMeasurements}
                        variant="outline"
                        className="w-full border-gray-600 text-white hover:bg-gray-700 flex items-center justify-center space-x-2"
                      >
                        <Ruler className="w-4 h-4" />
                        <span>Update Measurements</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-gray-400">No measurements recorded yet</p>
                      <Button 
                        onClick={onNavigateToMeasurements}
                        className="bg-white text-black hover:bg-gray-200 flex items-center space-x-2"
                      >
                        <Ruler className="w-4 h-4" />
                        <span>Add Measurements</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-white text-2xl">15</p>
                  <p className="text-gray-400">Outfits</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-2xl">42</p>
                  <p className="text-gray-400">Items</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-2xl">8</p>
                  <p className="text-gray-400">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}