import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import api from '../../utils/api';

interface Measurements {
    height?: string;
    weight?: string;
    chest?: string;
    waist?: string;
    hips?: string;
    shoulders?: string;
    neckCircumference?: string;
    sleeveLength?: string;
    inseam?: string;
    thigh?: string;
    skinColor?: string;
    description?: string;
}

interface BodyMeasurementsProps {
    username: string;
    onBackToDashboard: () => void;
    onSignOut: () => void;
}

export function BodyMeasurements({ username, onBackToDashboard, onSignOut }: BodyMeasurementsProps) {
    const { token,logout } = useAuth();
    const [measurements, setMeasurements] = useState<Measurements>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch measurements from backend
    useEffect(() => {
        console.log("🏁 Component mounted, fetching measurements...");
        fetchMeasurements();
    }, [token]); // This should re-fetch when token changes
    const fetchMeasurements = async () => {
        try {
            if (!token) {
                console.log("❌ No token available for fetching measurements");
                return;
            }

            console.log("🔄 Fetching measurements...");
            console.log("Using token:", token ? "Yes" : "No");

            const res = await api.get('/avatar/measurements/retrieve');

            console.log("✅ Fetch response status:", res.status);
            console.log("✅ Fetch response data:", res.data);

            if (res.data) {
                console.log("✅ Measurements found:", res.data);
                setMeasurements(res.data);
            } else {
                console.log("ℹ️ No measurements found (empty response)");
                setMeasurements({});
            }

        } catch (err: any) {
            console.error('❌ Fetch measurements error:', err);

            if (err.response) {
                console.log("Error status:", err.response.status);
                console.log("Error data:", err.response.data);
                console.log("Error headers:", err.response.headers);

                if (err.response.status === 404) {
                    console.log("ℹ️ No measurements found for user (404)");
                    setMeasurements({});
                    return;
                }
            }

            // Don't show alert for 404 - it's normal for new users
            if (err.response?.status !== 404) {
                alert('Failed to load measurements');
            }
        }
    };

    const handleInputChange = (field: keyof Measurements, value: string) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            if (!token) {
                alert('User not authenticated');
                return;
            }

            console.log("🔄 Attempting to save measurements...");
            const res = await api.post('/avatar/measurements/save', measurements);

            console.log("✅ Save successful:", res.data);
            alert('Measurements saved successfully!');
            setHasChanges(false);
        } catch (err: any) {
            console.error('❌ Save measurements error:', err);

            // More detailed error information
            if (err.response) {
                console.log("Error response:", err.response);
                console.log("Error status:", err.response.status);
                console.log("Error data:", err.response.data);
            }

            const errorMessage = err.response?.data?.error || err.message || 'Error saving measurements';
            alert('Error saving measurements: ' + errorMessage);

            // If it's still a 401 after all this, force logout
            if (err.response?.status === 401) {
                console.log("Forcing logout due to persistent 401");
                await logout();
            }
        }
    };

    const handleReset = () => {
        setMeasurements({});
        setHasChanges(false);
    };

    const measurementFields: { key: keyof Measurements; label: string }[] = [
        { key: 'height', label: 'Height (cm)' },
        { key: 'weight', label: 'Weight (kg)' },
        { key: 'chest', label: 'Chest/Bust (cm)' },
        { key: 'waist', label: 'Waist (cm)' },
        { key: 'hips', label: 'Hips (cm)' },
        { key: 'shoulders', label: 'Shoulders (cm)' },
        { key: 'neckCircumference', label: 'Neck Circumference (cm)' },
        { key: 'sleeveLength', label: 'Sleeve Length (cm)' },
        { key: 'inseam', label: 'Inseam (cm)' },
        { key: 'thigh', label: 'Thigh (cm)' },
        { key: 'skinColor', label: 'Skin Color' },
        { key: 'description', label: 'Description' }
    ];

    // Add this debug function to your BodyMeasurements component
    const debugTokenState = () => {
        const token = localStorage.getItem("jwt");
        console.log("🔍 Current Token State:");
        console.log("Token exists:", !!token);
        console.log("Token length:", token?.length);
        console.log("Token value:", token);

        // Check if token is expired
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = payload.exp * 1000;
                const now = Date.now();
                console.log("Token expires:", new Date(expiry));
                console.log("Is expired:", expiry < now);
                console.log("Time until expiry:", (expiry - now) / 1000, "seconds");
            } catch (e) {
                console.log("Could not parse token:", e);
            }
        }
    };

    // Call this in your useEffect or add a debug button
    useEffect(() => {
        debugTokenState();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white">Loading measurements...</div>
            </div>
        );
    }
    // Add this to your BodyMeasurements component
    const debugRefreshEndpoint = async () => {
        try {
            console.log("🔍 Testing refresh endpoint...");

            // Test with different methods to see what's supported
            const methods = ['GET', 'POST', 'PUT', 'PATCH'];

            for (const method of methods) {
                try {
                    const response = await fetch('/api/auth/refresh', {
                        method: method,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log(`${method} /api/auth/refresh → Status: ${response.status}`);
                } catch (error) {
                    console.log(`${method} /api/auth/refresh → Error: ${error}`);
                }
            }

            // Also test the exact URL pattern
            const testUrl = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });
            console.log("POST /api/auth/refresh exact → Status:", testUrl.status);

        } catch (error) {
            console.error("Debug refresh error:", error);
        }
    };

    // Call this in useEffect or add a button
    useEffect(() => {
        debugRefreshEndpoint();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBackToDashboard}
                            className="text-muted-foreground hover:text-foreground"
                            disabled={isLoading}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-foreground flex items-center space-x-2">
                            <span>Body Measurements</span>
                        </h1>
                    </div>
                    <Button
                        onClick={onSignOut}
                        variant="ghost"
                        className="text-foreground hover:bg-muted hover:text-foreground"
                        disabled={isLoading}
                    >
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Body Measurements</CardTitle>
                            <CardDescription className="text-gray-300">
                                Enter or update your body measurements. Fields are optional.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {measurementFields.map(field => (
                                    <div key={field.key} className="space-y-2">
                                        <Label htmlFor={field.key} className="text-white">{field.label}</Label>
                                        <Input
                                            id={field.key}
                                            value={measurements[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            disabled={isLoading}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-4">
                                <Button
                                    onClick={handleSave}
                                    className="bg-white text-black hover:bg-gray-200 flex items-center space-x-2"
                                    disabled={!hasChanges || isLoading}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isLoading ? 'Saving...' : 'Save Measurements'}</span>
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="ghost"
                                    className="text-white hover:bg-gray-800 hover:text-white flex items-center space-x-2"
                                    disabled={!hasChanges || isLoading}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Reset</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}