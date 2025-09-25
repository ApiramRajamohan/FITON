import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Routes>
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/admin-login" element={<AdminLoginPage />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { isAuthenticated, loading } = useAuth();
    const hasToken = !!localStorage.getItem('token');

    if (loading && !hasToken) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (isAuthenticated || hasToken) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <>
            {isLogin ? (
                <Login onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
                <Register onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </>
    );
};

const AdminLoginPage = () => {
    const { isAuthenticated, loading, isAdmin } = useAuth();
    const hasToken = !!localStorage.getItem('token');

    if (loading && !hasToken) {
        return <div className="loading-screen">Loading...</div>;
    }

    if ((isAuthenticated || hasToken) && isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Login isAdmin={true} />;
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default App;
