import React, { useState, useEffect } from 'react';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { WardrobeIcon } from '../ui/Icons';
import { Client } from "@gradio/client";

const WardrobePage = () => {
  const {
    wardrobes,
    topClothes,
    bottomClothes,
    fullClothes,
    loading,
    error,
    fetchWardrobes,
    fetchFilteredClothes,
    saveWardrobe,
    updateWardrobe,
    deleteWardrobe,
    clearError
  } = useWardrobe();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWardrobe, setEditingWardrobe] = useState(null);
  const [generatedImages, setGeneratedImages] = useState({});
  const [generating, setGenerating] = useState({});
  const [formData, setFormData] = useState({ 
    name: '',
    description: '',
    topClothesId: '',
    bottomClothesId: '',
    fullOutfitClothesId: '',
    accessories: '',
    occasion: 'Casual',
    season: 'All'
  });

  const occasions = ['Casual', 'Formal', 'Business', 'Party', 'Sport', 'Beach', 'Date', 'Travel'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All'];

  useEffect(() => {
    fetchFilteredClothes('top');
    fetchFilteredClothes('bottom');
    fetchFilteredClothes('full');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // If full outfit is selected, clear top and bottom
      if (name === 'fullOutfitClothesId' && value) {
        newData.topClothesId = '';
        newData.bottomClothesId = '';
      }
      
      // If top or bottom is selected, clear full outfit
      if ((name === 'topClothesId' || name === 'bottomClothesId') && value) {
        newData.fullOutfitClothesId = '';
      }
      
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      topClothesId: '',
      bottomClothesId: '',
      fullOutfitClothesId: '',
      accessories: '',
      occasion: 'Casual',
      season: 'All'
    });
    setShowCreateForm(false);
    setEditingWardrobe(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      return;
    }

    // Validate that user has selected either full outfit OR top/bottom, but not both
    const hasFullOutfit = !!formData.fullOutfitClothesId;
    const hasTopOrBottom = !!(formData.topClothesId || formData.bottomClothesId);
    
    if (!hasFullOutfit && !hasTopOrBottom) {
      alert('Please select either a full outfit OR at least one top/bottom clothing item.');
      return;
    }

    // Convert empty strings to null for IDs
    const wardrobeData = {
      ...formData,
      topClothesId: formData.topClothesId ? parseInt(formData.topClothesId) : null,
      bottomClothesId: formData.bottomClothesId ? parseInt(formData.bottomClothesId) : null,
      fullOutfitClothesId: formData.fullOutfitClothesId ? parseInt(formData.fullOutfitClothesId) : null,
    };

    let result;
    if (editingWardrobe) {
      result = await updateWardrobe(editingWardrobe.id, wardrobeData);
    } else {
      result = await saveWardrobe(wardrobeData);
    }

    if (result.success) {
      resetForm();
    }
  };

  const handleEdit = (wardrobe) => {
    setFormData({
      name: wardrobe.name,
      description: wardrobe.description,
      topClothesId: wardrobe.topClothesId || '',
      bottomClothesId: wardrobe.bottomClothesId || '',
      fullOutfitClothesId: wardrobe.fullOutfitClothesId || '',
      accessories: wardrobe.accessories,
      occasion: wardrobe.occasion,
      season: wardrobe.season
    });
    setEditingWardrobe(wardrobe);
    setShowCreateForm(true);
  };

  const handleDelete = async (wardrobeId) => {
    if (window.confirm('Are you sure you want to delete this wardrobe outfit?')) {
      await deleteWardrobe(wardrobeId);
    }
  };

  const getClothingItemName = (clothesArray, id) => {
    const item = clothesArray.find(c => c.id === id);
    return item ? item.name : 'Unknown';
  };

  const getClothingItem = (clothesArray, id) => {
    return clothesArray.find(c => c.id === id);
  };
    const generateOutfitImage = async (wardrobe) => {
        console.log(wardrobe);
        const id = wardrobe.id;
        setGenerating(prev => ({ ...prev, [id]: true }));

        try {
            const client = await Client.connect("HumanAIGC/OutfitAnyone");

            // Prepare prompt from wardrobe data
            const topItem = await fetch(getClothingItem(topClothes, wardrobe.topClothesId).image);
            const bottomItem = await fetch(getClothingItem(bottomClothes, wardrobe.bottomClothesId).image);
            const topImage = await topItem.blob();
            const bottomImage = await bottomItem.blob();
            const response_0 = await fetch("https://humanaigc-outfitanyone.hf.space/file=/tmp/gradio/28dbd2deba1e160bfadffbc3675ba4dcac20ca58/Eva_0.png");
            console.log(topItem);
            const exampleImage = await response_0.blob();
            const result = await client.predict("/get_tryon_result", {
                model_name: exampleImage,
                garment1: topImage,
                garment2: bottomImage,
            });
            // Gradio returns base64 string
            setGeneratedImages(prev => ({ ...prev, [id]: result.data }));
        } catch (err) {
            console.error("Failed to generate outfit:", err);
            alert("Failed to generate outfit image. Try again.");
        } finally {
            setGenerating(prev => ({ ...prev, [id]: false }));
        }

    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <WardrobeIcon className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Wardrobe
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Create complete outfits by combining tops, bottoms, and full pieces from your clothes collection
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error" className="mb-6">
            {error}
            <button onClick={clearError} className="ml-2 text-red-800 hover:text-red-900">
              ✕
            </button>
          </Alert>
        )}

        {/* Create New Wardrobe Button */}
        {!showCreateForm && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Create New Outfit
            </Button>
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-8 p-6 bg-white/80 backdrop-blur-sm shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editingWardrobe ? 'Edit Outfit' : 'Create New Outfit'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outfit Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter outfit name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe this outfit"
                  />
                </div>
              </div>

              {/* Clothing Selection */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Clothing Selection Rules:</h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Choose either a <strong>Full Outfit</strong> (dress/frock) OR combine <strong>Top + Bottom</strong> pieces</li>
                    <li>• You cannot select both full outfit and separate pieces at the same time</li>
                    <li>• Fields will be automatically disabled based on your selection</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top Clothing
                  </label>
                  <select
                    name="topClothesId"
                    value={formData.topClothesId}
                    onChange={handleInputChange}
                    disabled={!!formData.fullOutfitClothesId}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      !!formData.fullOutfitClothesId ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="">Select a top...</option>
                    {topClothes.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.type})
                      </option>
                    ))}
                  </select>
                  {!!formData.fullOutfitClothesId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Disabled because full outfit is selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bottom Clothing
                  </label>
                  <select
                    name="bottomClothesId"
                    value={formData.bottomClothesId}
                    onChange={handleInputChange}
                    disabled={!!formData.fullOutfitClothesId}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      !!formData.fullOutfitClothesId ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="">Select a bottom...</option>
                    {bottomClothes.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.type})
                      </option>
                    ))}
                  </select>
                  {!!formData.fullOutfitClothesId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Disabled because full outfit is selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Outfit (Dress/Frock)
                  </label>
                  <select
                    name="fullOutfitClothesId"
                    value={formData.fullOutfitClothesId}
                    onChange={handleInputChange}
                    disabled={!!(formData.topClothesId || formData.bottomClothesId)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      !!(formData.topClothesId || formData.bottomClothesId) ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="">Select a full outfit...</option>
                    {fullClothes.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.type})
                      </option>
                    ))}
                  </select>
                  {!!(formData.topClothesId || formData.bottomClothesId) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Disabled because top or bottom is selected
                    </p>
                  )}
                </div>
              </div>
              </div>

              {/* Selected Items Preview */}
              {(formData.topClothesId || formData.bottomClothesId || formData.fullOutfitClothesId) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Items Preview:</h4>
                  <div className="flex flex-col items-center space-y-3">
                    {formData.fullOutfitClothesId && (() => {
                      const fullItem = getClothingItem(fullClothes, parseInt(formData.fullOutfitClothesId));
                      return fullItem ? (
                        <div className="text-center">
                          {fullItem.image ? (
                            <img 
                              src={fullItem.image} 
                              alt={fullItem.name}
                              className="w-24 h-24 object-cover rounded-lg border-2 border-green-300 mx-auto"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-green-100 rounded-lg border-2 border-green-300 flex items-center justify-center mx-auto">
                              <span className="text-green-600 text-2xl">👗</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-2 max-w-20 truncate">{fullItem.name}</p>
                        </div>
                      ) : null;
                    })()}
                    
                    {formData.topClothesId && (() => {
                      const topItem = getClothingItem(topClothes, parseInt(formData.topClothesId));
                      return topItem ? (
                        <div className="text-center">
                          {topItem.image ? (
                            <img 
                              src={topItem.image} 
                              alt={topItem.name}
                              className="w-24 h-24 object-cover rounded-lg border-2 border-purple-300 mx-auto"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-purple-100 rounded-lg border-2 border-purple-300 flex items-center justify-center mx-auto">
                              <span className="text-purple-600 text-2xl">👕</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-2 max-w-20 truncate">{topItem.name}</p>
                        </div>
                      ) : null;
                    })()}
                    
                    {formData.bottomClothesId && (() => {
                      const bottomItem = getClothingItem(bottomClothes, parseInt(formData.bottomClothesId));
                      return bottomItem ? (
                        <div className="text-center">
                          {bottomItem.image ? (
                            <img 
                              src={bottomItem.image} 
                              alt={bottomItem.name}
                              className="w-24 h-24 object-cover rounded-lg border-2 border-blue-300 mx-auto"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-blue-100 rounded-lg border-2 border-blue-300 flex items-center justify-center mx-auto">
                              <span className="text-blue-600 text-2xl">👖</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-2 max-w-20 truncate">{bottomItem.name}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessories
                  </label>
                  <Input
                    type="text"
                    name="accessories"
                    value={formData.accessories}
                    onChange={handleInputChange}
                    placeholder="Shoes, bags, jewelry..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occasion
                  </label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {occasions.map(occasion => (
                      <option key={occasion} value={occasion}>
                        {occasion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {seasons.map(season => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <><Spinner size="sm" className="mr-2" /> Saving...</>
                  ) : (
                    editingWardrobe ? 'Update Outfit' : 'Create Outfit'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Wardrobes Grid */}
        {loading && wardrobes.length === 0 ? (
          <div className="text-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your wardrobe...</p>
          </div>
        ) : wardrobes.length === 0 ? (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
            <WardrobeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Outfits Yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first complete outfit by combining items from your clothes collection
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Create Your First Outfit
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wardrobes.map((wardrobe) => (
              <Card
                key={wardrobe.id}
                className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Outfit Preview Images */}
                  <div className="mb-4">
                    <div className="flex flex-col items-center space-y-3 mb-3">
                      {/* Full Outfit Display (if selected) */}
                      {wardrobe.fullOutfitClothesId && (() => {
                        const fullItem = getClothingItem(fullClothes, wardrobe.fullOutfitClothesId);
                        return fullItem?.image ? (
                          <img 
                            src={fullItem.image} 
                            alt={fullItem.name}
                            className="w-32 h-32 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-green-100 rounded-lg border-2 border-green-300 flex items-center justify-center">
                            <span className="text-green-600 text-4xl">👗</span>
                          </div>
                        );
                      })()}
                      
                      {/* Top & Bottom Display (if selected) */}
                      {wardrobe.topClothesId && (() => {
                        const topItem = getClothingItem(topClothes, wardrobe.topClothesId);
                        return topItem?.image ? (
                          <img 
                            src={topItem.image} 
                            alt={topItem.name}
                            className="w-32 h-32 object-cover rounded-lg border-2 border-purple-300 shadow-sm"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-purple-100 rounded-lg border-2 border-purple-300 flex items-center justify-center">
                            <span className="text-purple-600 text-4xl">👕</span>
                          </div>
                        );
                      })()}
                      
                      {wardrobe.bottomClothesId && (() => {
                        const bottomItem = getClothingItem(bottomClothes, wardrobe.bottomClothesId);
                        return bottomItem?.image ? (
                          <img 
                            src={bottomItem.image} 
                            alt={bottomItem.name}
                            className="w-32 h-32 object-cover rounded-lg border-2 border-blue-300 shadow-sm"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-blue-100 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                            <span className="text-blue-600 text-4xl">👖</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">
                      {wardrobe.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(wardrobe)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit outfit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(wardrobe.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete outfit"
                      >
                        🗑️
                      </button>
                      <Button
                          onClick={() => generateOutfitImage(wardrobe)}
                          disabled={generating[wardrobe.id]}
                          className="mt-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-sm px-3 py-1 rounded"
                        >
                          {generating[wardrobe.id] ? "Generating..." : "Generate"}
                        </Button>

                        {generatedImages[wardrobe.id] && (
                          <div className="mt-4">
                            <img
                              src={generatedImages[wardrobe.id]}
                              alt="Generated Outfit"
                              className="w-full h-auto rounded-lg border shadow-sm"
                            />
                          </div>
                        )}
                    </div>
                  </div>

                  {wardrobe.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {wardrobe.description}
                    </p>
                  )}

                  {/* Clothing Items */}
                  <div className="space-y-3 mb-4">
                    {wardrobe.topClothesId && (
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-purple-600 w-16 text-sm">Top:</span>
                        <div className="flex items-center space-x-3 flex-1">
                          {(() => {
                            const topItem = getClothingItem(topClothes, wardrobe.topClothesId);
                            return (
                              <>
                                {topItem?.image ? (
                                  <img 
                                    src={topItem.image} 
                                    alt={topItem.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-purple-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <span className="text-purple-600 text-lg">👕</span>
                                  </div>
                                )}
                                <span className="text-gray-700 text-sm">
                                  {topItem ? topItem.name : 'Unknown'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    {wardrobe.bottomClothesId && (
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-blue-600 w-16 text-sm">Bottom:</span>
                        <div className="flex items-center space-x-3 flex-1">
                          {(() => {
                            const bottomItem = getClothingItem(bottomClothes, wardrobe.bottomClothesId);
                            return (
                              <>
                                {bottomItem?.image ? (
                                  <img 
                                    src={bottomItem.image} 
                                    alt={bottomItem.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-blue-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <span className="text-blue-600 text-lg">👖</span>
                                  </div>
                                )}
                                <span className="text-gray-700 text-sm">
                                  {bottomItem ? bottomItem.name : 'Unknown'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    {wardrobe.fullOutfitClothesId && (
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-green-600 w-16 text-sm">Full:</span>
                        <div className="flex items-center space-x-3 flex-1">
                          {(() => {
                            const fullItem = getClothingItem(fullClothes, wardrobe.fullOutfitClothesId);
                            return (
                              <>
                                {fullItem?.image ? (
                                  <img 
                                    src={fullItem.image} 
                                    alt={fullItem.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-green-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <span className="text-green-600 text-lg">👗</span>
                                  </div>
                                )}
                                <span className="text-gray-700 text-sm">
                                  {fullItem ? fullItem.name : 'Unknown'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {wardrobe.occasion}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {wardrobe.season}
                    </span>
                  </div>

                  {wardrobe.accessories && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Accessories:</span> {wardrobe.accessories}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-4">
                    Created: {new Date(wardrobe.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobePage;