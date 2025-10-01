import { useState } from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Bell, Moon, Globe, Shield, Trash2, Shirt } from 'lucide-react';

interface UserProfile {
  username: string;
  email: string;
  fullName: string;
  bio: string;
  joinDate: string;
}

interface SettingsProps {
  username: string;
  userProfile: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToDashboard: () => void;
  onSignOut: () => void;
}

export function Settings({ username, userProfile, isDarkMode, onToggleDarkMode, onBackToDashboard, onSignOut }: SettingsProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    publicProfile: true,
    analytics: true,
    language: 'english'
  });

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLanguageChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      language: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      console.log('Account deletion requested');
      alert('Account deletion request submitted. You will receive an email confirmation.');
    }
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
            <h1 className="text-foreground">Settings</h1>
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
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Notifications Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-card-foreground">
                  Push Notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => handleSwitchChange('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailUpdates" className="text-card-foreground">
                  Email Updates
                </Label>
                <Switch
                  id="emailUpdates"
                  checked={settings.emailUpdates}
                  onCheckedChange={(checked: boolean) => handleSwitchChange('emailUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <Moon className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Customize your app appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="text-card-foreground">
                  Dark Mode
                </Label>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={onToggleDarkMode}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Language</span>
                </Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-input border-border text-card-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Control your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="publicProfile" className="text-card-foreground">
                  Public Profile
                </Label>
                <Switch
                  id="publicProfile"
                  checked={settings.publicProfile}
                  onCheckedChange={(checked: boolean) => handleSwitchChange('publicProfile', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="text-card-foreground">
                  Usage Analytics
                </Label>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked: boolean) => handleSwitchChange('analytics', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Account Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-card-foreground">Logged in as: {username}</p>
                <p className="text-muted-foreground">Account created: {userProfile?.joinDate || 'Unknown'}</p>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handleSaveSettings}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Settings
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <Button 
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </Button>
                <p className="text-gray-400 mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}