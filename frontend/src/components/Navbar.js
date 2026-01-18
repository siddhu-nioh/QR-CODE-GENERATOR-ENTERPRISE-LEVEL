import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { LogOut, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('session_token');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="dashboard-navbar">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')} data-testid="nav-logo">
          <QrCode className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-xl">QRPlanet</span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-sm">
                <span className="text-muted-foreground">Plan: </span>
                <span className="font-semibold capitalize text-primary" data-testid="user-plan">{user.plan}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/billing')} data-testid="billing-button">
                Upgrade
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="logout-button">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
