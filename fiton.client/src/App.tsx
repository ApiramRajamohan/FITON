import { useState, useEffect } from 'react';
import { SignUp } from './components/auth/SignUp';
import { SignIn } from './components/auth/SignIn';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Dashboard } from './components/wardrobe/Dashboard';
import { Profile } from './components/profile/Profile';
import { Settings } from './components/settings/Settings';
import { BodyMeasurements } from './components/measurements/BodyMeasurements';
import { AdminDashboard } from './components/admin/AdminDashboard';

type AppState = 'signin' | 'signup' | 'dashboard' | 'forgot-password' | 'profile' | 'settings' | 'measurements' | 'admin-dashboard';

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

export default function App() {
  const [currentView, setCurrentView] = useState<AppState>('signin');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to dark mode

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSwitchToSignUp = () => {
    setCurrentView('signup');
  };

  const handleSwitchToSignIn = () => {
    setCurrentView('signin');
  };

  const handleSignInSuccess = (username: string, password: string) => {
    // Check if admin credentials
    if (username === 'admin' && password === 'admin123') {
      setCurrentUser(username);
      setCurrentView('admin-dashboard');
      return;
    }
    
    // Regular user login
    setCurrentUser(username);
    // Initialize empty user profile if it doesn't exist
    if (!userProfiles[username]) {
      setUserProfiles(prev => ({
        ...prev,
        [username]: {
          username,
          email: '',
          fullName: '',
          bio: '',
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }
      }));
    }
    setCurrentView('dashboard');
  };

  const handleSignOut = () => {
    setCurrentUser('');
    setCurrentView('signin');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleNavigateToProfile = () => {
    setCurrentView('profile');
  };

  const handleNavigateToSettings = () => {
    setCurrentView('settings');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleNavigateToMeasurements = () => {
    setCurrentView('measurements');
  };

  const handleSaveMeasurements = (measurements: Measurements) => {
    setUserProfiles(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        measurements
      }
    }));
    console.log(`Measurements saved for ${currentUser}:`, measurements);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfiles(prev => ({
      ...prev,
      [currentUser]: updatedProfile
    }));
    console.log(`Profile updated for ${currentUser}:`, updatedProfile);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  switch (currentView) {
    case 'signup':
      return <SignUp onSwitchToSignIn={handleSwitchToSignIn} />;
    case 'signin':
      return (
        <SignIn 
          onSwitchToSignUp={handleSwitchToSignUp} 
          onSignInSuccess={handleSignInSuccess}
          onForgotPassword={handleForgotPassword}
        />
      );
    case 'admin-dashboard':
      return (
        <AdminDashboard 
          adminId={currentUser}
          userProfiles={userProfiles}
          onSignOut={handleSignOut}
        />
      );
    case 'forgot-password':
      return <ForgotPassword onBackToSignIn={handleSwitchToSignIn} />;
    case 'dashboard':
      return (
        <Dashboard 
          username={currentUser}
          onSignOut={handleSignOut}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToMeasurements={handleNavigateToMeasurements}
        />
      );
    case 'profile':
      return (
        <Profile 
          username={currentUser}
          userProfile={userProfiles[currentUser]}
          onUpdateProfile={handleUpdateProfile}
          onBackToDashboard={handleNavigateToDashboard}
          onSignOut={handleSignOut}
          onNavigateToMeasurements={handleNavigateToMeasurements}
        />
      );
    case 'settings':
      return (
        <Settings 
          username={currentUser}
          userProfile={userProfiles[currentUser]}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onBackToDashboard={handleNavigateToDashboard}
          onSignOut={handleSignOut}
        />
      );
    case 'measurements':
      return (
        <BodyMeasurements 
          username={currentUser}
          existingMeasurements={userProfiles[currentUser]?.measurements}
          onSaveMeasurements={handleSaveMeasurements}
          onBackToDashboard={handleNavigateToDashboard}
          onSignOut={handleSignOut}
        />
      );
    default:
      return (
        <SignIn 
          onSwitchToSignUp={handleSwitchToSignUp} 
          onSignInSuccess={handleSignInSuccess}
          onForgotPassword={handleForgotPassword}
        />
      );
  }
}