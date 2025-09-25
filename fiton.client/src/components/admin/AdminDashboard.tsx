import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Database,
  FileText,
  BarChart3,
  Shirt,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Input } from '../ui/input';

interface AdminDashboardProps {
  adminId: string;
  userProfiles: Record<string, any>;
  onSignOut: () => void;
}

export function AdminDashboard({ adminId, userProfiles, onSignOut }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock analytics data
  const analyticsData = {
    totalUsers: Object.keys(userProfiles).length,
    activeUsers: Math.floor(Object.keys(userProfiles).length * 0.8),
    newUsersThisWeek: Math.floor(Object.keys(userProfiles).length * 0.2),
    totalMeasurements: Object.values(userProfiles).filter(user => user.measurements).length,
    systemUptime: '99.9%',
    storageUsed: '45.6 GB'
  };

  // Filter users based on search
  const filteredUsers = Object.entries(userProfiles).filter(([username, profile]) =>
    username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ title, value, description, icon: Icon, trend }: any) => (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-foreground flex items-center space-x-2">
                <span>Admin Dashboard</span>
              </h1>
              <p className="text-sm text-muted-foreground">FitOn Virtual Wardrobe</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {adminId === 'superadmin' ? 'Super Admin' : 'Admin'}
            </Badge>
            <Button 
              onClick={onSignOut}
              variant="ghost"
              className="text-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={analyticsData.totalUsers}
                description="Registered users"
                icon={Users}
                trend="+12% from last month"
              />
              <StatCard
                title="Active Users"
                value={analyticsData.activeUsers}
                description="Active in last 7 days"
                icon={UserCheck}
                trend="+8% from last week"
              />
              <StatCard
                title="With Measurements"
                value={analyticsData.totalMeasurements}
                description="Users with saved measurements"
                icon={Activity}
                trend="+15% completion rate"
              />
              <StatCard
                title="System Uptime"
                value={analyticsData.systemUptime}
                description="Last 30 days"
                icon={Database}
              />
            </div>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Latest user actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(userProfiles).slice(0, 5).map(([username, profile]) => (
                    <div key={username} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary p-2 rounded-full">
                          <Shirt className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground">{profile.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.measurements ? 'Updated measurements' : 'Joined platform'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile.measurements ? 'default' : 'secondary'}>
                        {profile.measurements ? 'Active' : 'New'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center justify-between">
                  User Management
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage user accounts and view user details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Measurements</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(([username, profile]) => (
                        <TableRow key={username}>
                          <TableCell>
                            <div>
                              <p className="text-foreground">{profile.fullName}</p>
                              <p className="text-sm text-muted-foreground">@{username}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                          <TableCell className="text-muted-foreground">{profile.joinDate}</TableCell>
                          <TableCell>
                            <Badge variant={profile.measurements ? 'default' : 'secondary'}>
                              {profile.measurements ? 'Complete' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? 'No users found matching your search.' : 'No users registered yet.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">User Growth</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Registration trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Platform Usage</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Feature adoption and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Measurements Completed</span>
                      <span className="text-foreground">{Math.round((analyticsData.totalMeasurements / analyticsData.totalUsers) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Profile Completion</span>
                      <span className="text-foreground">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Daily Active Users</span>
                      <span className="text-foreground">{Math.floor(analyticsData.activeUsers * 0.7)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Storage Used</span>
                      <span className="text-foreground">{analyticsData.storageUsed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">System Health</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Current system status and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl text-green-600 mb-1">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl text-blue-600 mb-1">125ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl text-orange-600 mb-1">2.1GB</div>
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">System Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure system-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">User Registration</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Email Notifications</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Data Backup</span>
                    <Badge variant="default">Daily</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Maintenance Mode</span>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Admin Actions</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Administrative tools and utilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Export User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <UserX className="w-4 h-4 mr-2" />
                    Maintenance Mode
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}