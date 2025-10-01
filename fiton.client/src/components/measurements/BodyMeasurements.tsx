import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Ruler, Save, RotateCcw, AlertCircle, CheckCircle, Shirt } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { useAuth } from '../../contexts/AuthContext';

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

interface BodyMeasurementsProps {
  username: string;
  existingMeasurements?: Measurements;
  onSaveMeasurements: (measurements: Measurements) => void;
  onBackToDashboard: () => void;
  onSignOut: () => void;
}

const defaultMeasurements: Measurements = {
  chest: '',
  waist: '',
  hips: '',
  shoulders: '',
  inseam: '',
  height: '',
  weight: '',
  neckCircumference: '',
  sleeveLength: '',
  thigh: ''
};

interface ValidationErrors {
  [key: string]: string;
}

export function BodyMeasurements({ 
  username, 
  existingMeasurements, 
  onSaveMeasurements, 
  onBackToDashboard, 
  onSignOut 
}: BodyMeasurementsProps) {
  const [measurements, setMeasurements] = useState<Measurements>(defaultMeasurements);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [isGenerationEnabled, setIsGenerationEnabled] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');

  // Pre-fill measurements if they exist
  useEffect(() => {
    if (existingMeasurements) {
      setMeasurements(existingMeasurements);
      setIsGenerationEnabled(true);
    }
  }, [existingMeasurements]);

  const validateField = (field: keyof Measurements, value: string): string => {
    if (!value.trim()) {
      return `${field === 'neckCircumference' ? 'Neck circumference' : 
               field === 'sleeveLength' ? 'Sleeve length' : 
               field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    const numValue = parseFloat(value);
    
    // Define reasonable ranges for each measurement
    const ranges = {
      height: { min: 100, max: 250 },
      weight: { min: 30, max: 300 },
      chest: { min: 60, max: 150 },
      waist: { min: 50, max: 150 },
      hips: { min: 60, max: 150 },
      shoulders: { min: 30, max: 70 },
      neckCircumference: { min: 25, max: 50 },
      sleeveLength: { min: 40, max: 80 },
      inseam: { min: 50, max: 100 },
      thigh: { min: 35, max: 80 }
    };

    const range = ranges[field];
    if (numValue < range.min || numValue > range.max) {
      return `${field === 'neckCircumference' ? 'Neck circumference' : 
               field === 'sleeveLength' ? 'Sleeve length' : 
               field.charAt(0).toUpperCase() + field.slice(1)} must be between ${range.min} and ${range.max} cm`;
    }

    return '';
  };

  const handleInputChange = (field: keyof Measurements, value: string) => {
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMeasurements(prev => ({
        ...prev,
        [field]: value
      }));
      setHasChanges(true);
      
      // Validate field if it has been touched or if we're showing validation
      if (touched[field] || showValidation) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [field]: error
        }));
      }
    }
  };

  const handleFieldBlur = (field: keyof Measurements) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const error = validateField(field, measurements[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSave = () => {
    setShowValidation(true);
    
    // Validate all fields
    const newErrors: ValidationErrors = {};
    let hasAnyErrors = false;
    
    measurementFields.forEach(field => {
      const error = validateField(field.key, measurements[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasAnyErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    // Check if at least some basic measurements are provided
    const requiredFields = ['height', 'weight', 'chest', 'waist'];
    const hasRequiredFields = requiredFields.some(field => measurements[field as keyof Measurements]?.trim());
    
    if (!hasRequiredFields) {
      alert('Please provide at least your height, weight, chest, and waist measurements.');
      return;
    }
    
    if (hasAnyErrors) {
      alert('Please correct the errors before saving.');
      return;
    }
    
    onSaveMeasurements(measurements);
    setHasChanges(false);
    setShowValidation(false);
    setIsGenerationEnabled(true);
    alert('Measurements saved successfully!');
  };

  const handleReset = () => {
    if (existingMeasurements) {
      setMeasurements(existingMeasurements);
    } else {
      setMeasurements(defaultMeasurements);
    }
    setGender('');
    setHasChanges(false);
    setErrors({});
    setTouched({});
    setShowValidation(false);
    setIsGenerationEnabled(!!existingMeasurements);
  };

  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setAvatarImageUrl(null);
    if (!gender) {
      setGenerationError('Please select a gender before generating an avatar.');
      setIsGenerating(false);
      return;
    }

    const genderText = gender === 'male' ? 'male (biologically male)' : 'female (biologically female)';
    const safetyClause = 'Fully clothed in modest, neutral athletic or casual apparel: ' +
      (gender === 'male'
        ? 'fitted athletic top (no shirtless chest, no underwear) with shorts or training pants.'
        : 'supportive athletic top with high-waisted leggings (no cleavage emphasis, no underwear-only).') +
      ' No nudity. No transparent / see-through fabric. No sexual, suggestive or explicit styling. Natural realistic look.';

    // Build measurement list including only those the user provided (skip blanks)
    const measurementEntries: string[] = [];
    if (measurements.height) measurementEntries.push(`Height: ${measurements.height} cm`);
    if (measurements.weight) measurementEntries.push(`Weight: ${measurements.weight} kg`);
    if (measurements.chest) measurementEntries.push(`Chest/Bust: ${measurements.chest} cm`);
    if (measurements.waist) measurementEntries.push(`Waist: ${measurements.waist} cm`);
    if (measurements.hips) measurementEntries.push(`Hips: ${measurements.hips} cm`);
    if (measurements.shoulders) measurementEntries.push(`Shoulders: ${measurements.shoulders} cm`);
    if (measurements.neckCircumference) measurementEntries.push(`Neck Circumference: ${measurements.neckCircumference} cm`);
    if (measurements.sleeveLength) measurementEntries.push(`Sleeve Length: ${measurements.sleeveLength} cm`);
    if (measurements.inseam) measurementEntries.push(`Inseam: ${measurements.inseam} cm`);
    if (measurements.thigh) measurementEntries.push(`Thigh: ${measurements.thigh} cm`);

    const measurementsLine = measurementEntries.join(', ');

    const prompt = `Generate a realistic 3D ${genderText} human avatar using these body measurements exactly (do NOT invent or randomize proportions):\n${measurementsLine}.\nThe body shape MUST strictly reflect ONLY these provided measurements (no generic template). Preserve authentic proportional differences; do not exaggerate or smooth them.\nFull-body, front-facing, neutral relaxed pose. Realistic natural human anatomy derived from the measurements, neutral simple background, professional soft studio lighting, physically plausible materials, high quality 3D render. ${safetyClause}`;

    try {
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ prompt, gender })
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar. Please try again.');
      }

      const result = await response.json();
      console.log('Full API Response:', result); // Debug log

      // New canonical backend response: { success, image, url, raw }
      if (result.success) {
        if (result.image) {
          setAvatarImageUrl(result.image);
          return;
        }
        if (result.url) {
          setAvatarImageUrl(result.url);
          return;
        }
      }

      // Legacy / fallback parsing for any older format
      let imageUrl: string | null = null;
      if (result.data && result.data.url) {
        imageUrl = result.data.url;
      } else if (result.data && result.data.image_base64) {
        imageUrl = `data:image/png;base64,${result.data.image_base64}`;
      } else if (result.url) {
        imageUrl = result.url;
      } else if (result.image_url) {
        imageUrl = result.image_url;
      } else if (result.images && result.images.length > 0) {
        imageUrl = result.images[0].url || result.images[0];
      } else if (result.data && result.data.images && result.data.images.length > 0) {
        imageUrl = result.data.images[0].url || result.data.images[0];
      } else if (typeof result === 'string' && result.startsWith('http')) {
        imageUrl = result;
      }

      if (imageUrl) {
        setAvatarImageUrl(imageUrl);
        return;
      }

      const errorMsg = result.error || 'Could not retrieve image from the generation service.';
      console.error('Unexpected API response structure:', result);
      throw new Error(errorMsg);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const measurementFields = [
    { key: 'height' as keyof Measurements, label: 'Height', placeholder: 'Enter height in cm', required: true },
    { key: 'weight' as keyof Measurements, label: 'Weight (kg)', placeholder: 'Enter weight in kg', required: true },
    { key: 'chest' as keyof Measurements, label: 'Chest/Bust', placeholder: 'Enter measurement in cm', required: true },
    { key: 'waist' as keyof Measurements, label: 'Waist', placeholder: 'Enter measurement in cm', required: true },
    { key: 'hips' as keyof Measurements, label: 'Hips', placeholder: 'Enter measurement in cm', required: false },
    { key: 'shoulders' as keyof Measurements, label: 'Shoulders', placeholder: 'Enter measurement in cm', required: false },
    { key: 'neckCircumference' as keyof Measurements, label: 'Neck Circumference', placeholder: 'Enter measurement in cm', required: false },
    { key: 'sleeveLength' as keyof Measurements, label: 'Sleeve Length', placeholder: 'Enter measurement in cm', required: false },
    { key: 'inseam' as keyof Measurements, label: 'Inseam', placeholder: 'Enter measurement in cm', required: false },
    { key: 'thigh' as keyof Measurements, label: 'Thigh', placeholder: 'Enter measurement in cm', required: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-white p-2 rounded-lg">
              <Shirt className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-foreground flex items-center space-x-2">
              <Ruler className="w-5 h-5" />
              <span>Body Measurements</span>
            </h1>
          </div>
          <Button 
            onClick={onSignOut}
            variant="ghost"
            className="text-foreground hover:bg-muted hover:text-foreground"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Body Measurements</CardTitle>
              <CardDescription className="text-gray-300">
                Enter your body measurements in centimeters (cm). These will help you find better fitting clothes and track changes over time.
                {existingMeasurements && (
                  <span className="block mt-2 text-green-400">✓ You have saved measurements that have been pre-filled below.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validation Alert */}
              {showValidation && Object.keys(errors).some(key => errors[key]) && (
                <Alert className="border-red-600 bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    Please correct the errors below before saving your measurements.
                  </AlertDescription>
                </Alert>
              )}

              {/* Required Fields Info */}
              <Alert className="border-blue-600 bg-blue-900/20">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Fields marked with <span className="text-red-400">*</span> are required for accurate clothing recommendations.
                </AlertDescription>
              </Alert>

              {/* Measurement Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender Selection */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Gender <span className="text-red-400">*</span></Label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${gender === 'male' ? 'bg-white text-black border-white' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
                    >Male</button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${gender === 'female' ? 'bg-white text-black border-white' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
                    >Female</button>
                  </div>
                  {!gender && showValidation && (
                    <p className="text-red-400 text-sm flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Gender selection is required for avatar generation.</span>
                    </p>
                  )}
                </div>
                {measurementFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-white">
                      {field.label} (cm) {field.required && <span className="text-red-400">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        value={measurements[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        onBlur={() => handleFieldBlur(field.key)}
                        placeholder={field.placeholder}
                        className={`bg-gray-800 border-gray-600 text-white pr-12 ${
                          errors[field.key] ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.key === 'weight' ? 'kg' : 'cm'}
                      </span>
                    </div>
                    {errors[field.key] && (
                      <p className="text-red-400 text-sm flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors[field.key]}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Measurement Tips */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Measurement Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-2">
                  <p>• <strong>Chest/Bust:</strong> Measure around the fullest part of your chest</p>
                  <p>• <strong>Waist:</strong> Measure around your natural waistline</p>
                  <p>• <strong>Hips:</strong> Measure around the fullest part of your hips</p>
                  <p>• <strong>Shoulders:</strong> Measure from shoulder point to shoulder point</p>
                  <p>• <strong>Inseam:</strong> Measure from crotch to ankle along the inside of your leg</p>
                  <p>• <strong>Sleeve Length:</strong> Measure from shoulder to wrist with arm extended</p>
                  <p className="mt-4 text-yellow-400">💡 Tip: Have someone help you for more accurate measurements</p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleSave}
                  className="bg-white text-black hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Measurements</span>
                </Button>
                
                <Button 
                  onClick={handleReset}
                  variant="ghost"
                  className="text-white hover:bg-gray-800 hover:text-white flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              </div>

              {/* Current Measurements Summary */}
              {existingMeasurements && (
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Your Measurements Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {measurementFields.map((field) => (
                        measurements[field.key] && (
                          <div key={field.key} className="text-center">
                            <p className="text-gray-400">{field.label}</p>
                            <p className="text-white">{measurements[field.key]} cm</p>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Avatar Generation Section */}
              <AvatarDisplay
                isGenerating={isGenerating}
                generationError={generationError}
                avatarImageUrl={avatarImageUrl}
                onGenerate={handleGenerateAvatar}
                isGenerationEnabled={isGenerationEnabled}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}