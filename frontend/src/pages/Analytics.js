import React, { useState, useEffect,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

const Analytics = ({ user }) => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [qrData, setQrData] = useState(null);

useEffect(() => {
  fetchAnalytics();
}, [fetchAnalytics]);

  // useEffect(() => {
  //   fetchAnalytics();
  // }, [qrId]);

  // const fetchAnalytics = async () => {
  //   try {
  //     const token = localStorage.getItem('session_token');
      
  //     const [analyticsRes, qrRes] = await Promise.all([
  //       axios.get(`${API}/qr-codes/${qrId}/analytics`, {
  //         headers: { Authorization: `Bearer ${token}` }
  //       }),
  //       axios.get(`${API}/qr-codes/${qrId}`, {
  //         headers: { Authorization: `Bearer ${token}` }
  //       })
  //     ]);

  //     setAnalytics(analyticsRes.data);
  //     setQrData(qrRes.data);
  //   } catch (error) {
  //     console.error('Error fetching analytics:', error);
  //     toast.error(error.response?.data?.detail || 'Failed to load analytics');
  //     navigate('/dashboard');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
    setQrData(qrRes.data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    toast.error(error.response?.data?.detail || 'Failed to load analytics');
    navigate('/dashboard');
  } finally {
    setLoading(false);
  }
}, [qrId, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = Object.entries(analytics.scans_by_date || {}).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scans: count
  }));

  const deviceData = Object.entries(analytics.devices || {}).map(([device, count]) => ({
    name: device,
    value: count
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="min-h-screen bg-background" data-testid="analytics-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl mb-2" data-testid="analytics-title">Analytics</h1>
            <p className="text-muted-foreground">{qrData?.name}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6" data-testid="total-scans-card">
              <div className="flex items-center gap-4">
                <Activity className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="font-heading font-bold text-3xl" data-testid="total-scans">{analytics.total_scans}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" data-testid="unique-scans-card">
              <div className="flex items-center gap-4">
                <Activity className="h-10 w-10 text-chart-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Unique Scans</p>
                  <p className="font-heading font-bold text-3xl" data-testid="unique-scans">{analytics.unique_scans}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" data-testid="devices-card">
              <div className="flex items-center gap-4">
                <Smartphone className="h-10 w-10 text-chart-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Device Types</p>
                  <p className="font-heading font-bold text-3xl">{Object.keys(analytics.devices || {}).length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scans Over Time */}
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6">Scans Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scans" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Device Breakdown */}
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6">Device Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
