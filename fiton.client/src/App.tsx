import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SignUp } from './components/auth/SignUp';
import { SignIn } from './components/auth/SignIn';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Dashboard } from './components/wardrobe/Dashboard';
import { Profile } from './components/profile/Profile';
import { Settings } from './components/settings/Settings';
import { BodyMeasurements } from './components/measurements/BodyMeasurements';
import { AdminDashboard } from './components/admin/AdminDashboard';
import React from 'react';

type AppState =
    | 'signin'
    | 'signup'
    | 'dashboard'
    | 'forgot-password'
    | 'profile'
    | 'settings'
    | 'measurements'
    | 'admin-dashboard';

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
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    // Apply dark mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleSignInSuccess = (username: string, isAdmin = false) => {
        setCurrentUser(username);
        if (isAdmin) {
            setCurrentView('admin-dashboard');
            return;
        }

        if (!userProfiles[username]) {
            setUserProfiles((prev) => ({
                ...prev,
                [username]: {
                    username,
                    email: '',
                    fullName: '',
                    bio: '',
                    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                },
            }));
        }

        setCurrentView('dashboard');
    };

    const handleSignOut = () => {
        setCurrentUser('');
        setCurrentView('signin');
    };

    const handleSaveMeasurements = (measurements: Measurements) => {
        setUserProfiles((prev) => ({
            ...prev,
            [currentUser]: {
                ...prev[currentUser],
                measurements,
            },
        }));
    };

    const handleUpdateProfile = (updatedProfile: UserProfile) => {
        setUserProfiles((prev) => ({
            ...prev,
            [currentUser]: updatedProfile,
        }));
    };

    const handleToggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    return (
        <AuthProvider>
            {currentView === 'signup' && <SignUp onSwitchToSignIn={() => setCurrentView('signin')} />}
            {currentView === 'signin' && (
                <SignIn
                    onSwitchToSignUp={() => setCurrentView('signup')}
                    onSignInSuccess={(username) => handleSignInSuccess(username)}
                    onForgotPassword={() => setCurrentView('forgot-password')}
                />
            )}
            {currentView === 'forgot-password' && <ForgotPassword onBackToSignIn={() => setCurrentView('signin')} />}
            {currentView === 'dashboard' && (
                <Dashboard
                    username={currentUser}
                    onSignOut={handleSignOut}
                    onNavigateToProfile={() => setCurrentView('profile')}
                    onNavigateToSettings={() => setCurrentView('settings')}
                    onNavigateToMeasurements={() => setCurrentView('measurements')}
                />
            )}
            {currentView === 'profile' && (
                <Profile
                    username={currentUser}
                    userProfile={userProfiles[currentUser]}
                    onUpdateProfile={handleUpdateProfile}
                    onBackToDashboard={() => setCurrentView('dashboard')}
                    onSignOut={handleSignOut}
                    onNavigateToMeasurements={() => setCurrentView('measurements')}
                />
            )}
            {currentView === 'settings' && (
                <Settings
                    username={currentUser}
                    userProfile={userProfiles[currentUser]}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                    onBackToDashboard={() => setCurrentView('dashboard')}
                    onSignOut={handleSignOut}
                />
            )}
            {currentView === 'measurements' && (
                <BodyMeasurements
                    username={currentUser}
                    existingMeasurements={userProfiles[currentUser]?.measurements}
                    onSaveMeasurements={handleSaveMeasurements}
                    onBackToDashboard={() => setCurrentView('dashboard')}
                    onSignOut={handleSignOut}
                />
            )}
            {currentView === 'admin-dashboard' && (
                <AdminDashboard adminId={currentUser} userProfiles={userProfiles} onSignOut={handleSignOut} />
            )}
        </AuthProvider>
    );
}
