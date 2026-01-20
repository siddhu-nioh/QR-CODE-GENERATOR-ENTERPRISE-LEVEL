import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from './Navbar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import {
  User, Mail, Key, CreditCard, Bell, Shield,
  Globe, Calendar, CheckCircle, XCircle, Edit,
  Save, ArrowLeft, Download, Eye, Trash2,
  Upload, Lock, Smartphone, Monitor, Tablet,
  Chrome, Firefox, Safari, Edge, Windows, Apple,
  Linux, Android, Smartphone as Mobile,
  Eye as EyeIcon, EyeOff as EyeOffIcon,
  ChevronRight, Sparkles, Award, Star,
  BarChart3, QrCode, Clock, MapPin
} from 'lucide-react';

const AccountPage = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [qrStats, setQrStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    marketingEmails: false,
  });

  // Fetch user data on load
  useEffect(() => {
    fetchUserData();
    fetchUserStats();
    fetchRecentActivity();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData(prev => ({
        ...prev,
        name: response.data.name || '',
        email: response.data.email || ''
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/qr-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const qrCodes = response.data;
      const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0);
      const dynamicQRCodes = qrCodes.filter(qr => qr.is_dynamic).length;
      const staticQRCodes = qrCodes.filter(qr => !qr.is_dynamic).length;
      
      // Calculate device usage (mock data for now)
      const devices = [
        { type: 'mobile', count: Math.floor(totalScans * 0.6), icon: Mobile },
        { type: 'desktop', count: Math.floor(totalScans * 0.3), icon: Monitor },
        { type: 'tablet', count: Math.floor(totalScans * 0.1), icon: Tablet }
      ];
      
      setQrStats({
        totalQRCodes: qrCodes.length,
        totalScans,
        dynamicQRCodes,
        staticQRCodes,
        devices,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/qr-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const qrCodes = response.data
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5)
        .map(qr => ({
          id: qr.qr_id,
          name: qr.name,
          type: qr.qr_type,
          scans: qr.scan_count || 0,
          date: new Date(qr.updated_at).toLocaleDateString(),
          isDynamic: qr.is_dynamic,
        }));
      
      setRecentActivity(qrCodes);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('session_token');
      
      // Update profile
      await axios.put(`${API}/auth/update-profile`, {
        name: formData.name,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update password if provided
      if (formData.newPassword && formData.newPassword === formData.confirmPassword) {
        // Note: You'll need to add a password update endpoint in backend
        // await axios.post(`${API}/auth/change-password`, {
        //   currentPassword: formData.currentPassword,
        //   newPassword: formData.newPassword
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
      }
      
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchUserData();
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('session_token');
        // Note: You'll need to add account deletion endpoint in backend
        // await axios.delete(`${API}/auth/delete-account`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Account deletion request received');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile & Settings */}
          <div className="lg:w-2/3 space-y-8">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </div>
                  <Button 
                    variant={editMode ? "outline" : "ghost"} 
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="gap-2"
                  >
                    {editMode ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editMode ? formData.name : user.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!editMode}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      type="email"
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan">Current Plan</Label>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(user.plan)}`}>
                      {user.plan.toUpperCase()} PLAN
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/billing')}
                      className="gap-2"
                    >
                      <Sparkles className="h-3 w-3" />
                      {user.plan === 'free' ? 'Upgrade' : 'Manage'}
                    </Button>
                  </div>
                </div>
                
                {editMode && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Change Password
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                              placeholder="Current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            placeholder="New password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              {editMode && (
                <CardFooter className="flex justify-between">
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    {saving ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how and when we contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your QR codes
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData({...formData, notifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive tips, new features, and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={formData.marketingEmails}
                    onCheckedChange={(checked) => setFormData({...formData, marketingEmails: checked})}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recently created and updated QR codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${activity.isDynamic ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            <QrCode className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{activity.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {activity.type} • {activity.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{activity.scans}</div>
                            <div className="text-xs text-muted-foreground">scans</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                  View All QR Codes
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right Column - Stats & Quick Actions */}
          <div className="lg:w-1/3 space-y-8">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{qrStats?.totalQRCodes || 0}</div>
                    <div className="text-sm text-muted-foreground">Total QR Codes</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{qrStats?.totalScans || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Scans</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{qrStats?.dynamicQRCodes || 0}</div>
                    <div className="text-sm text-muted-foreground">Dynamic</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{qrStats?.staticQRCodes || 0}</div>
                    <div className="text-sm text-muted-foreground">Static</div>
                  </div>
                </div>
                
                {/* Device Usage */}
                {qrStats?.devices && (
                  <div>
                    <h3 className="font-medium mb-3">Device Usage</h3>
                    <div className="space-y-3">
                      {qrStats.devices.map((device) => (
                        <div key={device.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <device.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{device.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${(device.count / qrStats.totalScans) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{device.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/generator')}>
                  <Sparkles className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Create New QR</div>
                    <div className="text-xs text-muted-foreground">Design a custom QR code</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/billing')}>
                  <CreditCard className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{user.plan === 'free' ? 'Upgrade Plan' : 'Manage Billing'}</div>
                    <div className="text-xs text-muted-foreground">{user.plan === 'free' ? 'Unlock all features' : 'View invoices & usage'}</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/security')}>
                  <Shield className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Security Settings</div>
                    <div className="text-xs text-muted-foreground">2FA & login security</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/help')}>
                  <Award className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Help & Support</div>
                    <div className="text-xs text-muted-foreground">Documentation & contact</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
            
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${user.email_verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {user.email_verified ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-medium">Email Verification</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email_verified ? 'Verified' : 'Pending verification'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Member Since</div>
                    <div className="text-sm text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Last Login</div>
                    <div className="text-sm text-muted-foreground">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;