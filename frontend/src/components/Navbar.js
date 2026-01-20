import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import {
  LogOut, QrCode, User, ChevronDown, Sparkles,
  Link as LinkIcon, Phone, MessageSquare, Wifi,
  Music, Video, CreditCard, MapPin, FileText,
  Globe, Users, HelpCircle, Home, BarChart3,
  Image as ImageIcon, Settings, FileQuestion,
  BookOpen, Gift, Shield, Mail, Key, Bell,
  CreditCard as CreditCardIcon, UserCircle,
  Lock, Info, Award, Calendar, Globe as GlobeIcon,
  Sparkles as SparklesIcon, Download, Eye,
  Edit, Trash2, Star, CheckCircle, XCircle,
  AlertCircle, LogOut as LogOutIcon
} from 'lucide-react';
import { toast } from 'sonner';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRefs = useRef({});
  const accountDropdownRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Handle logout function from your original navbar
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('session_token');
      toast.success('Logged out successfully');
      navigate('/login');
      setMobileMenuOpen(false);
      setAccountDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // QR code types for dropdown
  const qrCodeTypes = [
    { icon: LinkIcon, label: 'URL', desc: 'Link to a website', route: '/create/url', color: 'bg-blue-500/10 text-blue-600' },
    { icon: Phone, label: 'Phone', desc: 'Call a number', route: '/create/phone', color: 'bg-green-500/10 text-green-600' },
    { icon: MessageSquare, label: 'SMS', desc: 'Send a text message', route: '/create/sms', color: 'bg-purple-500/10 text-purple-600' },
    { icon: Wifi, label: 'Wi-Fi', desc: 'Share network access', route: '/create/wifi', color: 'bg-amber-500/10 text-amber-600' },
    { icon: Music, label: 'MP3', desc: 'Link to audio file', route: '/create/mp3', color: 'bg-pink-500/10 text-pink-600' },
    { icon: Video, label: 'Zoom/Skype', desc: 'Start a meeting', route: '/create/meeting', color: 'bg-indigo-500/10 text-indigo-600' },
    { icon: CreditCard, label: 'PayPal', desc: 'Receive payments', route: '/create/payment', color: 'bg-teal-500/10 text-teal-600' },
    { icon: MapPin, label: 'Location', desc: 'Share a location', route: '/create/location', color: 'bg-red-500/10 text-red-600' },
    { icon: FileText, label: 'vCard', desc: 'Share contact details', route: '/create/vcard', color: 'bg-cyan-500/10 text-cyan-600' },
    { icon: Globe, label: 'Bitcoin', desc: 'Cryptocurrency address', route: '/create/crypto', color: 'bg-orange-500/10 text-orange-600' },
  ];

  // Resources navigation items (from your original)
  const resources = [
    { icon: BookOpen, label: 'Blog', desc: 'Latest QR code trends', route: '/blog' },
    { icon: FileQuestion, label: 'Help Center', desc: 'Get help & tutorials', route: '/help' },
    { icon: BarChart3, label: 'Case Studies', desc: 'Success stories', route: '/case-studies' },
    { icon: Shield, label: 'Security', desc: 'GDPR & Data protection', route: '/security' },
    { icon: Gift, label: 'Free Tools', desc: 'Additional utilities', route: '/tools' },
  ];

  const company = [
    { icon: Users, label: 'About Us', route: '/about' },
    { icon: Users, label: 'Our Team', route: '/team' },
    { icon: BarChart3, label: 'Careers', route: '/careers' },
    { icon: Shield, label: 'Privacy Policy', route: '/privacy' },
    { icon: FileText, label: 'Terms of Service', route: '/terms' },
  ];

  // Account menu items (NEW)
  const accountMenuItems = user ? [
    { icon: UserCircle, label: 'My Account', desc: 'View & edit profile', route: '/account', color: 'text-blue-600' },
    { icon: CreditCardIcon, label: 'Billing & Plans', desc: 'Manage subscription', route: '/billing', color: 'text-purple-600' },
    { icon: Key, label: 'Security', desc: 'Password & 2FA', route: '/account', color: 'text-green-600' },
    // { icon: Bell, label: 'Notifications', desc: 'Email preferences', route: '/notifications', color: 'text-amber-600' },
    { icon: BarChart3, label: 'Analytics', desc: 'View QR statistics', route: '/account', color: 'text-indigo-600' },
    { icon: QrCode, label: 'My QR Codes', desc: 'Manage all QR codes', route: '/dashboard', color: 'text-primary' },
    { type: 'divider' },
    { icon: LogOutIcon, label: 'Log Out', desc: 'Sign out of account', action: handleLogout, color: 'text-red-600' },
  ] : [];

  // Improved hover handlers with delay
  const handleMouseEnter = (dropdownName) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setActiveDropdown(dropdownName);
  };

  const handleMouseLeave = (dropdownName) => {
    hideTimeoutRef.current = setTimeout(() => {
      if (activeDropdown === dropdownName) {
        setActiveDropdown(null);
      }
    }, 200);
  };

  const handleDropdownMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleQRNavigation = (route) => {
    if (user) {
      navigate('/generator');
      setActiveDropdown(null);
    } else {
      navigate('/login');
      setActiveDropdown(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="dashboard-navbar">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo - Goes to dashboard when logged in, home when not */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => user ? navigate('/dashboard') : navigate('/')} data-testid="nav-logo">
            <QrCode className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-xl">QRPlanet</span>
          </div>

          {/* Desktop Navigation - ALL ORIGINAL DROPDOWNS KEPT */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            
            {/* Home */}
            <Button variant="ghost" onClick={() => user ? navigate('/dashboard') : navigate('/')} className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>

            {/* Create QR Dropdown (Mega Menu) - ORIGINAL */}
            <div 
              className="relative group"
              ref={el => dropdownRefs.current['create'] = el}
              onMouseEnter={() => handleMouseEnter('create')}
              onMouseLeave={() => handleMouseLeave('create')}
            >
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
                <Sparkles className="h-4 w-4" />
                Create QR
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'create' ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mega Dropdown - ORIGINAL */}
              {activeDropdown === 'create' && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 w-[42rem] bg-popover border rounded-xl shadow-xl p-6 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Choose QR Code Type
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Select what your QR Code will do</p>
                    </div>
                    {qrCodeTypes.map((type) => (
                      <button
                        key={type.label}
                        onClick={() => handleQRNavigation(type.route)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent group/card transition-all duration-150 hover:scale-[1.02] text-left w-full"
                      >
                        <div className={`p-2 rounded-md ${type.color} group-hover/card:scale-110 transition-transform duration-150`}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Need dynamic QR Codes?</h4>
                        <p className="text-sm text-muted-foreground">Track scans, edit content after printing</p>
                      </div>
                      <Button size="sm" onClick={() => navigate('/pricing')} className="animate-pulse">Upgrade to Pro</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features Dropdown - ORIGINAL */}
            <div 
              className="relative group"
              ref={el => dropdownRefs.current['features'] = el}
              onMouseEnter={() => handleMouseEnter('features')}
              onMouseLeave={() => handleMouseLeave('features')}
            >
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
                <BarChart3 className="h-4 w-4" />
                Features
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'features' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'features' && (
                <div 
                  className="absolute top-full mt-1 left-0 w-64 bg-popover border rounded-xl shadow-xl p-4 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <Link to="/features#analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-150">
                    <BarChart3 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-muted-foreground">Track scans & insights</div>
                    </div>
                  </Link>
                  <Link to="/features#customization" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-150">
                    <ImageIcon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Custom Design</div>
                      <div className="text-sm text-muted-foreground">Colors, logos, frames</div>
                    </div>
                  </Link>
                  <Link to="/features#dynamic" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-150">
                    <Settings className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Dynamic QR</div>
                      <div className="text-sm text-muted-foreground">Edit after printing</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown - ORIGINAL */}
            <div 
              className="relative group"
              ref={el => dropdownRefs.current['resources'] = el}
              onMouseEnter={() => handleMouseEnter('resources')}
              onMouseLeave={() => handleMouseLeave('resources')}
            >
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
                <BookOpen className="h-4 w-4" />
                Resources
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'resources' && (
                <div 
                  className="absolute top-full mt-1 left-0 w-64 bg-popover border rounded-xl shadow-xl p-4 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  {resources.map((resource) => (
                    <Link
                      key={resource.label}
                      to={resource.route}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-150"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <resource.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{resource.label}</div>
                        <div className="text-sm text-muted-foreground">{resource.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Company Dropdown - ORIGINAL */}
            <div 
              className="relative group"
              ref={el => dropdownRefs.current['company'] = el}
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={() => handleMouseLeave('company')}
            >
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
                <Users className="h-4 w-4" />
                Company
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'company' && (
                <div 
                  className="absolute top-full mt-1 left-0 w-64 bg-popover border rounded-xl shadow-xl p-4 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  {company.map((item) => (
                    <Link
                      key={item.label}
                      to={item.route}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-150"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="font-medium">{item.label}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Us - ORIGINAL */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/contact')}
              className="gap-2 hover:scale-105 transition-transform duration-200"
            >
              <HelpCircle className="h-4 w-4" />
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Right Side Actions - UPDATED WITH ACCOUNT DROPDOWN */}
          <div className="flex items-center gap-4" ref={accountDropdownRef}>
            {user ? (
              <>
                {/* Desktop user info - ORIGINAL UPGRADE BUTTON KEPT */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Plan: </span>
                    <span className="font-semibold capitalize text-primary" data-testid="user-plan">{user.plan}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/billing')} data-testid="billing-button">
                    Upgrade
                  </Button>
                </div>
                
                {/* Account Dropdown (NEW) */}
                <div className="relative">
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{user.name || user.email.split('@')[0]}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.plan} Plan</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Account Dropdown Menu (NEW) */}
                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-popover border rounded-xl shadow-xl p-2 animate-in fade-in-0 zoom-in-95 duration-200 z-50">
                      {/* User Info */}
                      <div className="p-3 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name || 'User'}</div>
                            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs flex items-center justify-between">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                            {user.plan} Plan
                          </span>
                          <span className="text-muted-foreground">
                            {user.qr_code_count || 0} QR Codes
                          </span>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        {accountMenuItems.map((item, index) => (
                          item.type === 'divider' ? (
                            <div key={`divider-${index}`} className="h-px bg-border my-1"></div>
                          ) : (
                            <button
                              key={item.label}
                              onClick={() => {
                                if (item.action) {
                                  item.action();
                                } else if (item.route) {
                                  navigate(item.route);
                                }
                                setAccountDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent transition-all duration-150 text-left"
                            >
                              <div className={`p-1.5 rounded-md ${item.color} bg-opacity-10`}>
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                              </div>
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Logged out state - ORIGINAL */}
                <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:flex">
                  Log In
                </Button>
                <Button onClick={() => navigate('/signup')} className="animate-bounce hover:animate-none">
                  Sign Up Free
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu - UPDATED WITH ACCOUNT OPTIONS */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {user && (
                <div className="p-3 border rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name || 'User'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-primary capitalize mt-1">{user.plan} Plan</div>
                    </div>
                  </div>
                </div>
              )}
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                <Home className="h-4 w-4 mr-2" /> Home
              </Button>
              
              {/* QR Creation Section - ORIGINAL */}
              <div className="space-y-1 pl-4">
                <p className="text-sm font-medium text-muted-foreground px-3 py-2">Create QR</p>
                <div className="grid grid-cols-2 gap-2">
                  {qrCodeTypes.slice(0, 6).map((type) => (
                    <Button
                      key={type.label}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => { navigate(type.route); setMobileMenuOpen(false); }}
                    >
                      <type.icon className="h-3 w-3 mr-1" /> {type.label}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => { navigate('/create'); setMobileMenuOpen(false); }}>
                  View all QR types →
                </Button>
              </div>

              {/* Features - ORIGINAL */}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/features'); setMobileMenuOpen(false); }}>
                <BarChart3 className="h-4 w-4 mr-2" /> Features
              </Button>
              
              {/* Resources - ORIGINAL */}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/resources'); setMobileMenuOpen(false); }}>
                <BookOpen className="h-4 w-4 mr-2" /> Resources
              </Button>
              
              {/* Company - ORIGINAL */}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>
                <Users className="h-4 w-4 mr-2" /> Company
              </Button>
              
              {/* Contact Us - ORIGINAL */}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>
                <HelpCircle className="h-4 w-4 mr-2" /> Contact Us
              </Button>

              {/* Account options for logged in users (NEW in mobile) */}
              {user && (
                <>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-muted-foreground px-3 py-2">Account</p>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/account'); setMobileMenuOpen(false); }}>
                      <User className="h-4 w-4 mr-2" /> My Account
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                      <QrCode className="h-4 w-4 mr-2" /> My QR Codes
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/billing'); setMobileMenuOpen(false); }}>
                      <CreditCardIcon className="h-4 w-4 mr-2" /> Billing & Plans
                    </Button>
                  </div>
                </>
              )}

              {/* For logged out users in mobile - ORIGINAL */}
              {!user && (
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                    Log In
                  </Button>
                  <Button className="w-full" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>
                    Sign Up Free
                  </Button>
                </div>
              )}
              
              {/* Logout for logged in users - ORIGINAL */}
              {user && (
                <div className="pt-4 border-t space-y-2">
                  <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </nav>
    </>
  );
};

export default Navbar;