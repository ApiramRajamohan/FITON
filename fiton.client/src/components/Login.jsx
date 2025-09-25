import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ onSwitchToRegister, isAdmin = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, adminLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const registered = location.state?.registered;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = isAdmin
            ? await adminLogin(formData.email, formData.password)
            : await login(formData.email, formData.password);

        if (!result.success) {
            setError(result.error || 'Login failed');
        } else {
            // After successful login take user to dashboard default view (profile)
            navigate('/dashboard', { replace: true });
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isAdmin ? 'Admin Login' : 'Login to FITON'}</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    {registered && !error && (
                        <div className="success-message" style={{background:'#d4edda',color:'#155724',padding:'0.75rem',borderRadius:6,border:'1px solid #c3e6cb'}}>
                            Account created successfully. Please log in.
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : (isAdmin ? 'Admin Login' : 'Login')}
                    </button>
                </form>

                {!isAdmin && (
                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToRegister}
                        >
                            Sign up
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
