// import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';

// Import existing pages
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

// Import new pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import ResourcesPage from './pages/ResourcesPage';
import HelpPage from './pages/HelpPage';
import SecurityPage from './pages/SecurityPage';

import './App.css';
import { useEffect, useState } from 'react';
import AccountPage from './pages/AccountPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Custom component to handle Stripe callback
  const StripeCallbackHandler = () => {
    const location = useLocation();
    
    // Check URL fragment for session_id
    if (location.hash?.includes('session_id=')) {
      return <AuthCallback setUser={setUser} />;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        {/* Stripe callback handler - placed outside Routes to always check URL */}
        <StripeCallbackHandler />
        
        <Routes>
          {/* Public Pages (they have their own Navbar inside with user prop) */}
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/pricing" element={<Pricing user={user} />} />
          <Route path="/about" element={   <ProtectedRoute>
            <AboutPage user={user} />
               </ProtectedRoute>} />
          <Route path="/contact" element={   <ProtectedRoute><ContactPage user={user} /> </ProtectedRoute>} />
          <Route path="/features" element={<ProtectedRoute><FeaturesPage user={user} /> </ProtectedRoute>} />
          <Route path="/resources" element={   <ProtectedRoute><ResourcesPage user={user} /> </ProtectedRoute>} />
          <Route path="/help" element={   <ProtectedRoute><HelpPage user={user} /></ProtectedRoute>} />
          <Route path="/security" element={   <ProtectedRoute><SecurityPage user={user}/></ProtectedRoute> } />
          <Route path="/privacy" element={<SecurityPage user={user} />} />
          <Route path="/terms" element={<SecurityPage user={user} />} />
          <Route path="/blog" element={<ResourcesPage user={user} />} />
          <Route path="/case-studies" element={<ResourcesPage user={user} />} />
          <Route path="/tools" element={<ResourcesPage user={user} />} />

          {/* Auth Pages without user prop */}
          <Route path="/login" element={<Login  />} />

          {/* Protected Dashboard Pages - ProtectedRoute fetches user internally */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/generator" element={
            <ProtectedRoute>
              <QRGenerator />
            </ProtectedRoute>
          } />

          <Route path="/account" element={
            <ProtectedRoute>
            <AccountPage user={user} />
            </ProtectedRoute>
            } />
          <Route path="/designer/:qrId" element={
            <ProtectedRoute>
              <QRDesigner />
            </ProtectedRoute>
          } />
          <Route path="/analytics/:qrId" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/billing/success" element={
            <ProtectedRoute>
              <BillingSuccess />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;