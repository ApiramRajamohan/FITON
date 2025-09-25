import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, measurementAPI, handleAPIError } from '../utils/api';
import { useSearchParams } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') || 'profile').toLowerCase();
    const [activeTab, setActiveTab] = useState(['profile','admin'].includes(initialTab) ? initialTab : 'profile');
    const [showMeasurementModal, setShowMeasurementModal] = useState(false);
    const [showMeasurementList, setShowMeasurementList] = useState(false);

    useEffect(() => {
        // Keep URL in sync when tab changes
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set('tab', activeTab);
            return params;
        }, { replace: true });
    }, [activeTab, setSearchParams]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const decodeTokenSub = () => {
        try {
            const t = localStorage.getItem('token');
            if (!t) return null;
            const payload = JSON.parse(atob(t.split('.')[1]));
            return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        } catch { return null; }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const [profileData, statsData] = await Promise.allSettled([
                dashboardAPI.getUserProfile(),
                dashboardAPI.getUserStats()
            ]);

            if (profileData.status === 'fulfilled') setUserProfile(profileData.value);
            if (statsData.status === 'fulfilled') setStats(statsData.value);

            if (isAdmin) {
                try {
                    const usersData = await dashboardAPI.getAllUsers();
                    setAllUsers(usersData);
                } catch (err) {
                    setError(prev => prev || handleAPIError(err));
                }
            }

            if (profileData.status === 'rejected' || statsData.status === 'rejected') {
                const tokenSub = decodeTokenSub();
                setError(prev => prev || `Some data failed to load. (debug sub=${tokenSub ?? 'null'}) You can still enter your measurements below.`);
            }
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>FITON Dashboard</h1>
                    <div className="user-info">
                        <span>Welcome, {user?.Username || user?.username}!</span>
                        {isAdmin && <span className="admin-badge">Admin</span>}
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {error && (
                <div className="error-message" style={{ margin: '1rem auto', maxWidth: 1200 }}>
                    {error}
                    <div>
                        <button onClick={loadDashboardData} className="retry-button" style={{ marginTop: '0.5rem' }}>Retry</button>
                    </div>
                </div>
            )}

            <nav className="dashboard-nav">
                <button
                    className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className="nav-tab"
                    onClick={() => setShowMeasurementModal(true)}
                >
                    Input Measurements
                </button>
                <button
                    className="nav-tab"
                    onClick={() => setShowMeasurementList(prev => !prev)}
                >
                    {showMeasurementList ? 'Hide Measurements' : 'View Measurements'}
                </button>
                {isAdmin && (
                    <button
                        className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admin')}
                    >
                        User Management
                    </button>
                )}
            </nav>

            <main className="dashboard-content">
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <h2>User Profile</h2>
                        <div className="profile-card">
                            <div className="profile-info">
                                <p><strong>Username:</strong> {userProfile?.Username ?? '-'}</p>
                                <p><strong>Email:</strong> {userProfile?.Email ?? '-'}</p>
                                <p><strong>Account Type:</strong> {userProfile?.IsAdmin ? 'Admin' : 'User'}</p>
                                <p><strong>Profile Status:</strong>
                                    <span className={stats?.ProfileComplete ? 'status-complete' : 'status-incomplete'}>
                                        {stats?.ProfileComplete ? 'Complete' : 'Incomplete'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {showMeasurementModal && (
                    <MeasurementModal
                        onClose={() => setShowMeasurementModal(false)}
                        measurements={userProfile?.Measurements}
                        onSaved={() => { setShowMeasurementModal(false); loadDashboardData(); }}
                    />
                )}

                {showMeasurementList && (
                    <MeasurementList
                        measurements={userProfile?.Measurements}
                        onEdit={() => setShowMeasurementModal(true)}
                        onDeleted={loadDashboardData}
                    />
                )}

                {activeTab === 'admin' && isAdmin && (
                    <div className="tab-content">
                        <h2>User Management</h2>
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Type</th>
                                        <th>Measurements</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map(user => (
                                        <tr key={user.Id}>
                                            <td>{user.Id}</td>
                                            <td>{user.Username}</td>
                                            <td>{user.Email}</td>
                                            <td>{user.IsAdmin ? 'Admin' : 'User'}</td>
                                            <td>
                                                <span className={user.HasMeasurements ? 'status-yes' : 'status-no'}>
                                                    {user.HasMeasurements ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const MeasurementModal = ({ measurements, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        height: measurements?.Height || measurements?.height || '',
        weight: measurements?.Weight || measurements?.weight || '',
        chest: measurements?.Chest || measurements?.chest || '',
        waist: measurements?.Waist || measurements?.waist || '',
        hips: measurements?.Hips || measurements?.hips || '',
        inseam: measurements?.Inseam || measurements?.inseam || ''
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (/^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ message: '', type: '' });
        const newErrors = {};
        for (const key in formData) {
            if (!formData[key]) newErrors[key] = `${key} is required`;
        }
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }
        setErrors({});
        try {
            await measurementAPI.saveMeasurements(formData);
            setStatus({ message: 'Saved!', type: 'success' });
            onSaved();
        } catch (err) {
            setStatus({ message: handleAPIError(err), type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>{measurements ? 'Edit Measurements' : 'Add Measurements'}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="measurement-form">
                    <div className="form-grid">
                        {Object.keys(formData).map(key => (
                            <div className="form-group" key={key}>
                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)} (cm)</label>
                                <input id={key} name={key} value={formData[key]} onChange={handleChange} />
                                {errors[key] && <p className="error-text">{errors[key]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
                    </div>
                    {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
                </form>
            </div>
        </div>
    );
};

const MeasurementList = ({ measurements, onEdit, onDeleted }) => {
  const [status, setStatus] = useState('');
  const handleDelete = async () => {
    if (!window.confirm('Delete measurements?')) return;
    try {
      await measurementAPI.deleteMeasurements();
      setStatus('Deleted');
      onDeleted();
    } catch (err) {
      setStatus(handleAPIError(err));
    }
  };
  if (!measurements) return <div className="tab-content"><p>No measurements recorded yet.</p></div>;
  const items = [
    ['Height', measurements.Height],
    ['Weight', measurements.Weight],
    ['Chest', measurements.Chest],
    ['Waist', measurements.Waist],
    ['Hips', measurements.Hips],
    ['Inseam', measurements.Inseam]
  ];
  return (
    <div className="tab-content">
      <h2>Your Measurements</h2>
      <table className="measurements-table">
        <thead><tr><th>Metric</th><th>Value (cm)</th></tr></thead>
        <tbody>
          {items.map(([label, val]) => (
            <tr key={label}><td>{label}</td><td>{val ?? '-'}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={onEdit} className="submit-button">Edit</button>
        <button onClick={handleDelete} className="danger-button">Delete</button>
      </div>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default Dashboard;
