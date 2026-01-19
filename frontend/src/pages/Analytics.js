import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Smartphone, Monitor, Globe, MapPin, Clock,
  TrendingUp, Users, Eye, Download, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const QR_FIELD_CONFIG = {
  url: [{ key: "url", label: "Destination URL", placeholder: "https://example.com" }],
  text: [{ key: "text", label: "Text", placeholder: "Enter text" }],
  phone: [{ key: "phone", label: "Phone Number", placeholder: "+1234567890" }],
  sms: [
    { key: "phone", label: "Phone Number" },
    { key: "message", label: "Message" }
  ],
  whatsapp: [
    { key: "phone", label: "WhatsApp Number" },
    { key: "message", label: "Message" }
  ],
  email: [
    { key: "email", label: "Email Address" },
    { key: "subject", label: "Subject" },
    { key: "body", label: "Email Body" }
  ],
  wifi: [
    { key: "ssid", label: "WiFi Name (SSID)" },
    { key: "password", label: "Password" },
    { key: "encryption", label: "Encryption (WPA/WEP)" }
  ],
  vcard: [
    { key: "name", label: "Full Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "website", label: "Website" }
  ],
  location: [
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" }
  ],
  payment: [
    { key: "payment_url", label: "Payment URL" }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = ({ user }) => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (qrData) {
    setEditName(qrData.name || "");
    setEditContent(qrData.content || {});
  }
}, [qrData]);
  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('session_token');
      
      const [analyticsRes, qrRes] = await Promise.all([
        axios.get(`${API}/qr-codes/${qrId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/qr-codes/${qrId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalytics(analyticsRes.data);
      const qrData = qrRes.data;
      setQrData(qrData);
      setEditName(qrData.name || "");
      setEditContent(qrData.content || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error.response?.data?.detail || 'Failed to load analytics');
      navigate('/dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [qrId, navigate]);

  useEffect(() => {
    fetchAnalytics();

    // ✅ REALTIME WEBSOCKET
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "qr_scan" && data.qr_id === qrId) {
        fetchAnalytics(); // 🔁 refresh analytics instantly
      }
    };

    return () => ws.close();
  }, [fetchAnalytics, qrId]);

  // Handle QR update
  const handleUpdateQR = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("session_token");

      await axios.put(
        `${API}/qr-codes/${qrId}`,
        {
          name: editName,
          content: editContent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("QR updated successfully");
      fetchAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Export to CSV functionality from uploaded version
  const exportToCSV = () => {
    if (!analytics || !analytics.recent_scans) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      ['Timestamp', 'Device', 'Browser', 'OS', 'Country', 'City', 'IP Address'].join(','),
      ...analytics.recent_scans.map(scan => [
        scan.timestamp,
        scan.device,
        scan.browser,
        scan.os,
        scan.country || 'Unknown',
        scan.city || 'Unknown',
        scan.ip_address
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-analytics-${qrId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Analytics exported to CSV!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = analytics.scans_by_date || [];
  const deviceData = analytics.devices || [];
  const browserData = analytics.browsers || [];
  const osData = analytics.operating_systems || [];
  const hourlyData = analytics.scans_by_hour || [];

  return (
    <div className="min-h-screen bg-background" data-testid="analytics-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Enhanced from uploaded version */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-4xl mb-2" data-testid="analytics-title">
                QR Code Analytics
              </h1>
              <p className="text-muted-foreground">
                {qrData?.name} - Real-time tracking and insights
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Edit QR Section - From your current code */}
          {qrData?.is_dynamic && (
            <Card className="p-6 mb-8">
              <h2 className="font-heading font-semibold text-xl mb-4">
                Edit Dynamic QR
              </h2>

              {/* QR NAME */}
              <div className="mb-4">
                <Label>QR Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* TYPE-SPECIFIC FIELDS */}
              {QR_FIELD_CONFIG[qrData.qr_type]?.map((field) => (
                <div key={field.key} className="mb-4">
                  <Label>{field.label}</Label>
                  <Input
                    value={editContent[field.key] || ""}
                    placeholder={field.placeholder || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        [field.key]: e.target.value
                      })
                    }
                    className="mt-2"
                  />
                </div>
              ))}

              <Button
                className="mt-4"
                onClick={handleUpdateQR}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update QR"}
              </Button>
            </Card>
          )}

          {/* Stats Overview - Enhanced from uploaded version */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                  <p className="text-3xl font-bold" data-testid="total-scans">{analytics.total_scans}</p>
                </div>
                <Activity className="h-10 w-10 text-primary opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                All time
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unique Visitors</p>
                  <p className="text-3xl font-bold" data-testid="unique-scans">{analytics.unique_scans}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Unique IP addresses
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Device</p>
                  <p className="text-2xl font-bold">
                    {deviceData.length > 0
                      ? deviceData.sort((a, b) => b.count - a.count)[0].name
                      : 'N/A'}
                  </p>
                </div>
                <Smartphone className="h-10 w-10 text-green-500 opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Most used device
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Location</p>
                  <p className="text-2xl font-bold">
                    {analytics.top_countries && analytics.top_countries.length > 0
                      ? analytics.top_countries[0].name
                      : 'N/A'}
                  </p>
                </div>
                <Globe className="h-10 w-10 text-purple-500 opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Most scans from
              </p>
            </Card>
          </div>

          {/* Charts Section - Enhanced from uploaded version */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Scans Over Time - Line Chart */}
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Scans Over Time
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Device Breakdown */}
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Device Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name} (${entry.count})`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Scans by Hour */}
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Scans by Hour
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="scans" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Browser Breakdown */}
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Browser Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={browserData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name} (${entry.count})`}
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top Locations - New section from uploaded version */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Top Countries
              </h2>
              <div className="space-y-3">
                {analytics.top_countries && analytics.top_countries.length > 0 ? (
                  analytics.top_countries.map((country, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg text-primary">{idx + 1}</span>
                        <span className="font-medium">{country.name || 'Unknown'}</span>
                      </div>
                      <span className="text-muted-foreground">{country.count} scans</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No location data available</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Top Cities
              </h2>
              <div className="space-y-3">
                {analytics.top_cities && analytics.top_cities.length > 0 ? (
                  analytics.top_cities.map((city, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg text-primary">{idx + 1}</span>
                        <span className="font-medium">{city.name || 'Unknown'}</span>
                      </div>
                      <span className="text-muted-foreground">{city.count} scans</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No city data available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Scans Table - New section from uploaded version */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Recent Scans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Timestamp</th>
                    <th className="text-left p-3 text-sm font-semibold">Device</th>
                    <th className="text-left p-3 text-sm font-semibold">Browser</th>
                    <th className="text-left p-3 text-sm font-semibold">OS</th>
                    <th className="text-left p-3 text-sm font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recent_scans && analytics.recent_scans.length > 0 ? (
                    analytics.recent_scans.map((scan, idx) => (
                      <tr key={idx} className="border-b hover:bg-secondary/30 transition-colors">
                        <td className="p-3 text-sm">
                          {new Date(scan.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-sm capitalize">{scan.device}</td>
                        <td className="p-3 text-sm">{scan.browser}</td>
                        <td className="p-3 text-sm">{scan.os}</td>
                        <td className="p-3 text-sm">
                          {scan.city && scan.country 
                            ? `${scan.city}, ${scan.country}`
                            : scan.country || scan.city || 'Unknown'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-muted-foreground">
                        No scan data available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;