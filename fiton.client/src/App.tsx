import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SignUp } from "./components/auth/SignUp";
import { SignIn } from "./components/auth/SignIn";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { Dashboard } from "./components/wardrobe/Dashboard";
import { Profile } from "./components/profile/Profile";
import { Settings } from "./components/settings/Settings";
import { BodyMeasurements } from "./components/measurements/BodyMeasurements";
import { AdminDashboard } from "./components/admin/AdminDashboard";

type AppState =
    | "signin"
    | "signup"
    | "forgot-password"
    | "dashboard"
    | "profile"
    | "settings"
    | "measurements"
    | "admin-dashboard";

interface Measurements {
    chest?: string;
    waist?: string;
    hips?: string;
    shoulders?: string;
    inseam?: string;
    height?: string;
    weight?: string;
    neckCircumference?: string;
    sleeveLength?: string;
    thigh?: string;
    skinColor?: string;
    description?: string;
}

interface UserProfile {
    username: string;
    email: string;
    measurements?: Measurements;
}

function AppContent() {
    const { token, logout } = useAuth();
    const [currentView, setCurrentView] = useState<AppState>("signin");
    const [currentUser, setCurrentUser] = useState<string>("");
    const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    // Apply dark mode
    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    }, [isDarkMode]);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!token) {
            setCurrentView("signin");
        } else if (token && currentView === "signin") {
            setCurrentView("dashboard");
        }
    }, [token]);

    const handleSignInSuccess = (email: string, username: string, isAdmin = false) => {
        setCurrentUser(username);

        if (isAdmin) {
            setCurrentView("admin-dashboard");
            return;
        }

        if (!userProfiles[email]) {
            setUserProfiles((prev) => ({
                ...prev,
                [email]: { username, email },
            }));
        }

        setCurrentView("dashboard");
    };

    const handleSignOut = async () => {
        await logout();
        setCurrentUser("");
        setCurrentView("signin");
    };

    const handleSaveMeasurements = (measurements: Measurements) => {
        setUserProfiles((prev) => ({
            ...prev,
            [currentUser]: { ...prev[currentUser], measurements },
        }));
    };

    const handleUpdateProfile = (updatedProfile: UserProfile) => {
        setUserProfiles((prev) => ({
            ...prev,
            [currentUser]: updatedProfile,
        }));
    };

    const handleToggleDarkMode = () => setIsDarkMode((prev) => !prev);

    
    if (!token) {
        switch (currentView) {
            case "signup":
                return <SignUp onSwitchToSignIn={() => setCurrentView("signin")} />;
            case "signin":
                return (
                    <SignIn
                        onSwitchToSignUp={() => setCurrentView("signup")}
                        onSignInSuccess={(email, username) => handleSignInSuccess(email, username)}
                        onForgotPassword={() => setCurrentView("forgot-password")}
                    />
                );
            case "forgot-password":
                return <ForgotPassword onBackToSignIn={() => setCurrentView("signin")} />;
            default:
                return <SignIn onSwitchToSignUp={() => setCurrentView("signup")} onSignInSuccess={() => { }} onForgotPassword={() => { }} />;
        }
    }

   
    switch (currentView) {
        case "dashboard":
            return (
                <Dashboard
                    username={currentUser}
                    onSignOut={handleSignOut}
                    onNavigateToProfile={() => setCurrentView("profile")}
                    onNavigateToSettings={() => setCurrentView("settings")}
                    onNavigateToMeasurements={() => setCurrentView("measurements")}
                />
            );
        case "profile":
            return (
                <Profile
                    username={currentUser}
                    userProfile={userProfiles[currentUser]}
                    onUpdateProfile={handleUpdateProfile}
                    onBackToDashboard={() => setCurrentView("dashboard")}
                    onSignOut={handleSignOut}
                    onNavigateToMeasurements={() => setCurrentView("measurements")}
                />
            );
        case "settings":
            return (
                <Settings
                    username={currentUser}
                    userProfile={userProfiles[currentUser]}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                    onBackToDashboard={() => setCurrentView("dashboard")}
                    onSignOut={handleSignOut}
                />
            );
        case "measurements":
            return (
                <BodyMeasurements
                    username={currentUser}
                    existingMeasurements={userProfiles[currentUser]?.measurements}
                    onSaveMeasurements={handleSaveMeasurements}
                    onBackToDashboard={() => setCurrentView("dashboard")}
                    onSignOut={handleSignOut}
                />
            );
        case "admin-dashboard":
            return <AdminDashboard adminId={currentUser} userProfiles={userProfiles} onSignOut={handleSignOut} />;
        default:
            return <Dashboard username={currentUser} onSignOut={handleSignOut} />;
    }
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
