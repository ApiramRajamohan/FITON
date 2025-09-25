import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Ruler, Save, RotateCcw, AlertCircle, CheckCircle, Shirt } from 'lucide-react';

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

  // Pre-fill measurements if they exist
  useEffect(() => {
    if (existingMeasurements) {
      setMeasurements(existingMeasurements);
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
    alert('Measurements saved successfully!');
  };

  const handleReset = () => {
    if (existingMeasurements) {
      setMeasurements(existingMeasurements);
    } else {
      setMeasurements(defaultMeasurements);
    }
    setHasChanges(false);
    setErrors({});
    setTouched({});
    setShowValidation(false);
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}