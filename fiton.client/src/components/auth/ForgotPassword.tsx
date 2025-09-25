import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onBackToSignIn: () => void;
}

export function ForgotPassword({ onBackToSignIn }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Check Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              Password reset instructions sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-900 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              
              <p className="text-gray-300">
                We've sent password reset instructions to <span className="text-white">{email}</span>
              </p>
              
              <p className="text-gray-400">
                Check your email and follow the link to reset your password. 
                If you don't see the email, check your spam folder.
              </p>
            </div>
            
            <Button 
              onClick={onBackToSignIn}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              Back to Sign In
            </Button>
            
            <div className="text-center">
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-gray-400 hover:text-white"
              >
                Try a different email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <button 
              onClick={onBackToSignIn}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-white">Reset Password</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              Send Reset Instructions
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Remember your password?{' '}
              <button 
                onClick={onBackToSignIn}
                className="text-white hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}