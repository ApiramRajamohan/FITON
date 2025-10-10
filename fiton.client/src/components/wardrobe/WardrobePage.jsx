import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { Input } from '../ui/Input';
import { 
  WardrobeIcon, 
  ArrowRightIcon,
  PlusIcon,
  LogoutIcon,
  TrashIcon,
  EditIcon,
  SparklesIcon,
  XIcon
} from '../ui/Icons';

export const WardrobePage = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { outfits, isLoading, error, deleteOutfit, saveOutfit, updateOutfit, isSaving } = useWardrobe();
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Casual',
    brand: '',
    size: '',
    color: '',
    type: 'Shirt',
    imageUrl: ''
  });
  const [formError, setFormError] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteOutfit = async (outfitId) => {
    const outfit = outfits.find(o => o.id === outfitId);
    const itemName = outfit ? outfit.name : 'this item';
    
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      try {
        await deleteOutfit(outfitId);
        // Optional: Show success message
        console.log('Outfit deleted successfully');
      } catch (error) {
        console.error('Delete outfit failed:', error);
        alert('Failed to delete outfit. Please try again.');
      }
    }
  };

  const handleAddOutfit = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditOutfit = (outfit) => {
    setEditingOutfit(outfit);
    setShowEditForm(true);
    setFormError(null);
    // Pre-fill form with existing outfit data
    setFormData({
      name: outfit.name,
      description: outfit.description,
      category: outfit.category,
      brand: outfit.brand,
      size: outfit.size,
      color: outfit.color,
      type: outfit.type,
      imageUrl: outfit.imageUrl
    });
    // Set image preview if outfit has an image
    setImagePreview(outfit.imageUrl || null);
    setImageFile(null);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingOutfit(null);
    setFormError(null);
    setImageFile(null);
    setImagePreview(null);
    // Reset form to default values
    setFormData({
      name: '',
      description: '',
      category: 'Casual',
      brand: '',
      size: '',
      color: '',
      type: 'Shirt',
      imageUrl: ''
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image file size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error
      setFormError(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim()) {
      setFormError('Item name is required');
      return;
    }

    if (!formData.type.trim()) {
      setFormError('Type is required');
      return;
    }

    try {
      let imageUrl = formData.imageUrl;
      
      // If there's a new image file, convert it to base64
      if (imageFile) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const outfitToSave = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        size: formData.size,
        color: formData.color,
        type: formData.type,
        imageUrl: imageUrl
      };

      if (showEditForm && editingOutfit) {
        // Update existing outfit
        await updateOutfit(editingOutfit.id, outfitToSave);
        setShowEditForm(false);
        setEditingOutfit(null);
      } else {
        // Create new outfit
        await saveOutfit(outfitToSave);
        setShowAddForm(false);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Casual',
        brand: '',
        size: '',
        color: '',
        type: 'Shirt',
        imageUrl: ''
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      setFormError(error.response?.data?.error || `Failed to ${showEditForm ? 'update' : 'save'} item`);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <WardrobeIcon size="xl" className="text-purple-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">No clothing items yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start building your digital wardrobe by adding your first clothing item!
      </p>
      <Button variant="primary" className="inline-flex items-center" onClick={handleAddOutfit}>
        <PlusIcon size="sm" className="mr-2" />
        Add Your First Item
      </Button>
    </div>
  );

  const OutfitCard = ({ outfit }) => (
    <Card 
      variant="elevated" 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => setSelectedOutfit(outfit)}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-xl">
          {outfit.imageUrl && outfit.imageUrl !== "/images/outfit1.jpg" ? (
            <img 
              src={outfit.imageUrl} 
              alt={outfit.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
              <WardrobeIcon size="xl" className="text-purple-600" />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-purple-700">
            {outfit.category}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              {outfit.name}
            </h3>
            <p className="text-sm text-gray-500">{outfit.type}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditOutfit(outfit);
              }}
              className="h-10 w-10 p-0"
              title="Edit item"
            >
              <EditIcon size="sm" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteOutfit(outfit.id);
              }}
              className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Delete item"
            >
              <TrashIcon size="sm" />
            </Button>
          </div>
        </div>
        
        {outfit.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{outfit.description}</p>
        )}
        
        <div className="space-y-3">
          {/* Primary details */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {outfit.type}
            </span>
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {outfit.category}
            </span>
          </div>
          
          {/* Secondary details */}
          {(outfit.brand || outfit.color || outfit.size) && (
            <div className="flex flex-wrap gap-1.5">
              {outfit.brand && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                  <span className="font-medium">Brand:</span> {outfit.brand}
                </span>
              )}
              {outfit.color && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                  <span className="font-medium">Color:</span> {outfit.color}
                </span>
              )}
              {outfit.size && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                  <span className="font-medium">Size:</span> {outfit.size}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>Created {new Date(outfit.createdAt).toLocaleDateString()}</span>
          <span className="text-purple-600 font-medium">View Details</span>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-fashion rounded-xl">
                <WardrobeIcon size="md" className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wardrobe</h1>
                <p className="text-gray-600">Manage your saved outfits</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleBackToDashboard}
                className="hidden sm:flex"
              >
                <ArrowRightIcon size="sm" className="mr-2 rotate-180" />
                Back to Dashboard
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogoutIcon size="sm" className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <Alert variant="error">
              <h3 className="font-bold">Error loading wardrobe</h3>
              <p>{error}</p>
            </Alert>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Clothing Items</h2>
            <p className="text-gray-600">
              {outfits.length === 0 ? 'No items saved' : `${outfits.length} item${outfits.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          
          <Button variant="primary" className="inline-flex items-center" onClick={handleAddOutfit}>
            <PlusIcon size="sm" className="mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Outfits Grid */}
        {outfits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {outfits.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" disabled>
              All items loaded
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Back Button */}
      <div className="sm:hidden fixed bottom-6 left-6">
        <Button 
          variant="primary" 
          onClick={handleBackToDashboard}
          className="rounded-full shadow-lg"
        >
          <ArrowRightIcon size="sm" className="rotate-180" />
        </Button>
      </div>

      {/* Add/Edit New Outfit Modal */}
      {(showAddForm || showEditForm) && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowAddForm(false);
            setShowEditForm(false);
            setEditingOutfit(null);
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showEditForm ? 'Edit Clothing Item' : 'Add New Clothing Item'}
                </h2>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={resetForm}
                >
                  <XIcon size="sm" />
                </Button>
              </div>

              {formError && (
                <div className="mb-4">
                  <Alert variant="error">
                    {formError}
                  </Alert>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Cotton T-Shirt, Denim Jeans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your clothing item..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Casual">Casual</option>
                      <option value="Business">Business</option>
                      <option value="Formal">Formal</option>
                      <option value="Sport">Sport</option>
                      <option value="Evening">Evening</option>
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="Shirt">Shirt</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Pants">Pants</option>
                      <option value="Jeans">Jeans</option>
                      <option value="Shorts">Shorts</option>
                      <option value="Dress">Dress</option>
                      <option value="Skirt">Skirt</option>
                      <option value="Jacket">Jacket</option>
                      <option value="Sweater">Sweater</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Boots">Boots</option>
                      <option value="Sandals">Sandals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <Input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., Nike, Zara, H&M"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    >
                      <option value="">Select Size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="28">28</option>
                      <option value="30">30</option>
                      <option value="32">32</option>
                      <option value="34">34</option>
                      <option value="36">36</option>
                      <option value="38">38</option>
                      <option value="40">40</option>
                      <option value="42">42</option>
                      <option value="44">44</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select a color</option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Gray">Gray</option>
                      <option value="Navy">Navy</option>
                      <option value="Blue">Blue</option>
                      <option value="Red">Red</option>
                      <option value="Pink">Pink</option>
                      <option value="Purple">Purple</option>
                      <option value="Green">Green</option>
                      <option value="Yellow">Yellow</option>
                      <option value="Orange">Orange</option>
                      <option value="Brown">Brown</option>
                      <option value="Beige">Beige</option>
                      <option value="Cream">Cream</option>
                      <option value="Maroon">Maroon</option>
                      <option value="Olive">Olive</option>
                      <option value="Teal">Teal</option>
                      <option value="Turquoise">Turquoise</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Multi-color">Multi-color</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Image (optional)
                    </label>
                    
                    {/* Image Upload Area */}
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearImage}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <div className="mx-auto h-12 w-12 text-gray-400 mb-3 text-4xl">
                            📸
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Click to upload an image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="inline-flex items-center"
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusIcon size="sm" className="mr-2" />
                      {showEditForm ? 'Update Item' : 'Save Item'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outfit Detail Modal (future enhancement) */}
      {selectedOutfit && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOutfit(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedOutfit.name}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedOutfit(null)}
              >
                ✕
              </Button>
            </div>
            <p className="text-gray-600 mb-4">{selectedOutfit.description}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-600">{selectedOutfit.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{selectedOutfit.category}</span>
                </div>
                {selectedOutfit.brand && (
                  <div>
                    <span className="font-medium text-gray-700">Brand:</span>
                    <span className="ml-2 text-gray-600">{selectedOutfit.brand}</span>
                  </div>
                )}
                {selectedOutfit.size && (
                  <div>
                    <span className="font-medium text-gray-700">Size:</span>
                    <span className="ml-2 text-gray-600">{selectedOutfit.size}</span>
                  </div>
                )}
                {selectedOutfit.color && (
                  <div>
                    <span className="font-medium text-gray-700">Color:</span>
                    <span className="ml-2 text-gray-600">{selectedOutfit.color}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer with Edit and Delete Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={() => setSelectedOutfit(null)}
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedOutfit(null);
                    handleEditOutfit(selectedOutfit);
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <EditIcon size="sm" className="mr-2" />
                  Edit Item
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setSelectedOutfit(null);
                    handleDeleteOutfit(selectedOutfit.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon size="sm" className="mr-2" />
                  Delete Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};