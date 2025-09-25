import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Shirt } from 'lucide-react';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: (username: string, password: string) => void;
  onForgotPassword: () => void;
}

export function SignIn({ onSwitchToSignUp, onSignInSuccess, onForgotPassword }: SignInProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signin logic here
    console.log('Sign in:', formData);
    
    // Check if admin credentials
    if (formData.username === 'admin' && formData.password === 'admin123') {
      alert('Welcome back, Admin!');
    } else {
      alert('Welcome back!');
    }
    
    onSignInSuccess(formData.username, formData.password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-full">
              <Shirt className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-foreground">FitOn Virtual Wardrobe</h1>
          <p className="text-muted-foreground">
            Welcome back to your virtual wardrobe
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-card-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your FitOn wardrobe
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="bg-input-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="bg-input-background"
              />
            </div>
            
            <div className="flex justify-end mb-4">
              <button 
                type="button"
                onClick={onForgotPassword}
                className="text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <button 
                onClick={onSwitchToSignUp}
                className="text-foreground hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>



        </CardContent>
        </Card>
      </div>
    </div>
  );
}