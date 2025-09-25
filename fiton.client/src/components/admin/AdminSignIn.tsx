import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Eye, EyeOff, AlertCircle, Shirt } from 'lucide-react';

interface AdminSignInProps {
  onAdminSignInSuccess: (adminId: string) => void;
  onBackToUserLogin: () => void;
}

export function AdminSignIn({ onAdminSignInSuccess, onBackToUserLogin }: AdminSignInProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock admin credentials
  const adminCredentials = {
    'admin': 'admin123',
    'superadmin': 'super123'
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!adminId.trim() || !password.trim()) {
      setError('Please enter both Admin ID and password');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (adminCredentials[adminId as keyof typeof adminCredentials] === password) {
      onAdminSignInSuccess(adminId);
    } else {
      setError('Invalid Admin ID or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-full">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground">
            FitOn Virtual Wardrobe Administration
          </p>
        </div>

        {/* Admin Sign In Form */}
        <Card className="bg-card border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-card-foreground">Admin Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="adminId" className="text-foreground">Admin ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter your admin ID"
                  className="bg-input-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-input-background pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In as Admin'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Demo Admin Credentials:</p>
              <div className="text-sm space-y-1">
                <p className="text-foreground"><strong>Admin ID:</strong> admin</p>
                <p className="text-foreground"><strong>Password:</strong> admin123</p>
                <hr className="my-2 border-border" />
                <p className="text-foreground"><strong>Super Admin:</strong> superadmin</p>
                <p className="text-foreground"><strong>Password:</strong> super123</p>
              </div>
            </div>

            {/* Back to User Login */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={onBackToUserLogin}
                className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Shirt className="w-4 h-4 mr-2" />
                Back to User Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}