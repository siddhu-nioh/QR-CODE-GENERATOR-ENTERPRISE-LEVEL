import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QRGenerator from './pages/QRGenerator';
import QRDesigner from './pages/QRDesigner';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import BillingSuccess from './pages/BillingSuccess';
import Pricing from './pages/Pricing';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
axios.defaults.withCredentials = true;

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('session_token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem('session_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
    const withNavbar = (Component, props = {}) => (
    <>
      <Navbar user={user} />
      <Component {...props} />
    </>
  );
  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />
         <Route path="/about" element={withNavbar(AboutPage)} />
          <Route path="/contact" element={withNavbar(ContactPage)} />
          <Route path="/features" element={withNavbar(FeaturesPage)} />
          <Route path="/resources" element={withNavbar(ResourcesPage)} />
          <Route path="/help" element={withNavbar(HelpPage)} />
          <Route path="/security" element={withNavbar(SecurityPage)} />
          <Route path="/privacy" element={withNavbar(SecurityPage)} />
          <Route path="/terms" element={withNavbar(SecurityPage)} />
          <Route path="/blog" element={withNavbar(ResourcesPage)} />
          <Route path="/case-studies" element={withNavbar(ResourcesPage)} />
          <Route path="/tools" element={withNavbar(ResourcesPage)} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/generator" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
      <Route path="/designer/:qrId" element={<ProtectedRoute><QRDesigner /></ProtectedRoute>} />
      <Route path="/analytics/:qrId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      <Route path="/billing/success" element={<ProtectedRoute><BillingSuccess /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
