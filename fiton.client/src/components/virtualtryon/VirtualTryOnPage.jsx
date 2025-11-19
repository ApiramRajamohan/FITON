import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { DownloadIcon, SaveIcon } from '../ui/Icons';

export const VirtualTryOnPage = () => {
    const [wardrobes, setWardrobes] = useState([]);
    const [measurements, setMeasurements] = useState(null);
    const [selectedWardrobeId, setSelectedWardrobeId] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [apiMessage, setApiMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const wardrobeRes = await api.get('/wardrobe');
                setWardrobes(wardrobeRes.data.data || []);

                const measurementRes = await api.get('/avatar/measurements/retrieve');
                setMeasurements(measurementRes.data);
            } catch (err) {
                setError('Failed to load initial data. Please make sure you have added measurements and wardrobe items.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleGenerateClick = async () => {
        if (!selectedWardrobeId) {
            setError('Please select a wardrobe outfit first.');
            return;
        }

        setError('');
        setApiMessage('');
        setGeneratedPrompt('');
        setSaveSuccess('');
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const response = await api.post('/virtual-try-on/generate', {
                wardrobeId: selectedWardrobeId
            });
            
            // Handle response data
            setGeneratedImage(response.data.imageUrl);
            
            // Display additional info if available (for mock responses)
            if (response.data.message) {
                setApiMessage(response.data.message);
            }
            if (response.data.prompt) {
                setGeneratedPrompt(response.data.prompt);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadImage = () => {
        if (!generatedImage) return;
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `virtual-tryon-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToCollection = async () => {
        if (!generatedImage) return;
        
        setIsSaving(true);
        setSaveSuccess('');
        setError('');
        
        try {
            // Convert base64 to blob
            const base64Data = generatedImage.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            // Create FormData
            const formData = new FormData();
            formData.append('image', blob, `virtual-tryon-${Date.now()}.png`);
            formData.append('name', `Virtual Try-On - ${new Date().toLocaleDateString()}`);
            formData.append('description', `Generated try-on image`);
            formData.append('type', 'Virtual Try-On');
            formData.append('category', 'AI Generated');
            formData.append('color', 'Mixed');
            formData.append('brand', 'FITON AI');
            formData.append('size', 'Custom');
            
            // Save to clothes collection
            await api.post('/clothes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSaveSuccess('✅ Image saved to your collection successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to save image to collection.';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingData) {
        return <div className="p-8"><Spinner /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Selections */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">1. Select Your Outfit</h2>
                    </CardHeader>
                    <CardContent>
                        {wardrobes.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {wardrobes.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedWardrobeId(item.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedWardrobeId === item.id ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'}`}
                                    >
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm opacity-80">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert variant="warning">No wardrobe outfits found. Please create one first.</Alert>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">2. Your Measurements</h2>
                        <p className="text-sm text-gray-600">View your body measurements</p>
                    </CardHeader>
                    <CardContent>
                        {measurements ? (
                            <div className="space-y-3">
                                {/* Gender - Prominent Display */}
                                {measurements.gender && (
                                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                                        <label className="block text-xs font-medium text-purple-700 mb-1">Gender</label>
                                        <p className="text-base font-bold text-purple-900">{measurements.gender}</p>
                                    </div>
                                )}

                                {/* Basic Measurements */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Height</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.height || 'N/A'} cm</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Weight</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.weight || 'N/A'} kg</p>
                                    </div>
                                </div>

                                {/* Body Measurements */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Chest</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.chest || 'N/A'} cm</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Waist</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.waist || 'N/A'} cm</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Hips</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.hips || 'N/A'} cm</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Shoulders</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.shoulders || 'N/A'} cm</p>
                                    </div>
                                </div>

                                {/* Additional Measurements */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Neck</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.neckCircumference || 'N/A'} cm</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Sleeve</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.sleeveLength || 'N/A'} cm</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Inseam</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.inseam || 'N/A'} cm</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Thigh</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.thigh || 'N/A'} cm</p>
                                    </div>
                                </div>

                                {/* Skin Color */}
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Skin Tone</label>
                                    <p className="text-sm font-semibold text-gray-900">{measurements.skinColor || 'N/A'}</p>
                                </div>

                                {/* Description */}
                                {measurements.description && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Additional Notes</label>
                                        <p className="text-sm font-semibold text-gray-900">{measurements.description}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                           <Alert variant="warning">No measurements found. Please add them on the Measurements page.</Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Generation and Result */}
            <div className="lg:col-span-2">
                <Card className="sticky top-24">
                    <CardHeader>
                        <h2 className="text-xl font-bold">3. Generate Your Try-On</h2>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button
                            onClick={handleGenerateClick}
                            disabled={isLoading || !selectedWardrobeId || !measurements}
                            isLoading={isLoading}
                            size="lg"
                            variant="gradient"
                        >
                            Generate Virtual Try-On
                        </Button>

                        {error && <Alert variant="error" className="mt-4 text-left">{error}</Alert>}
                        {apiMessage && <Alert variant="warning" className="mt-4 text-left">{apiMessage}</Alert>}
                        {saveSuccess && <Alert variant="success" className="mt-4 text-left">{saveSuccess}</Alert>}

                        {/* Image Display Container - Full Height */}
                        <div className="mt-6 w-full bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed overflow-hidden">
                            {isLoading && (
                                <div className="py-32">
                                    <Spinner size="lg" />
                                    <p className="mt-4 text-gray-600">Generating your virtual try-on...</p>
                                </div>
                            )}
                            
                            {!isLoading && generatedImage && (
                                <div className="w-full">
                                    <img 
                                        src={generatedImage} 
                                        alt="Virtual try-on result" 
                                        className="w-full h-auto object-contain max-h-[600px] rounded-xl"
                                    />
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3 justify-center p-4 bg-white border-t">
                                        <Button
                                            onClick={handleDownloadImage}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <DownloadIcon size="sm" />
                                            Download Image
                                        </Button>
                                        <Button
                                            onClick={handleSaveToCollection}
                                            disabled={isSaving}
                                            isLoading={isSaving}
                                            variant="primary"
                                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        >
                                            <SaveIcon size="sm" />
                                            {isSaving ? 'Saving...' : 'Save to Collection'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {!isLoading && !generatedImage && (
                                <div className="py-32">
                                    <p className="text-gray-500">Your generated image will appear here</p>
                                </div>
                            )}
                        </div>
                        
                        {generatedPrompt && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                                <h3 className="font-semibold text-sm text-blue-900 mb-2">Generated Prompt:</h3>
                                <p className="text-xs text-blue-800">{generatedPrompt}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};