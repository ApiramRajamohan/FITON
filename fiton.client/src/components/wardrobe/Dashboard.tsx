import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User, Settings, LogOut, Ruler, Shirt, Plus, TrendingUp } from 'lucide-react';

interface DashboardProps {
  username: string;
  onSignOut: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToMeasurements: () => void;
}

export function Dashboard({ username, onSignOut, onNavigateToProfile, onNavigateToSettings, onNavigateToMeasurements }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Shirt className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-foreground">FitOn Virtual Wardrobe</h1>
              <p className="text-muted-foreground">Welcome back, {username}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={onNavigateToProfile}
              variant="ghost"
              className="text-foreground hover:bg-muted hover:text-foreground flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Button>
            <Button 
              onClick={onNavigateToSettings}
              variant="ghost"
              className="text-foreground hover:bg-muted hover:text-foreground flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
            <Button 
              onClick={onSignOut}
              variant="ghost"
              className="text-foreground hover:bg-muted hover:text-foreground flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <Shirt className="w-5 h-5" />
                <span>My Clothes</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your virtual wardrobe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center space-x-2">
                <Shirt className="w-4 h-4" />
                <span>View Wardrobe</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Outfit Planner</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create and save outfit combinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Plan Outfits</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Shops</CardTitle>
              <CardDescription className="text-muted-foreground">
                Discover and shop from your favorite stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Shops
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <Ruler className="w-5 h-5" />
                <span>Body Measurements</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track your measurements for better fitting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onNavigateToMeasurements}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center space-x-2"
              >
                <Ruler className="w-4 h-4" />
                <span>Enter Measurements</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Wardrobe Analytics</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track your clothing usage and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}