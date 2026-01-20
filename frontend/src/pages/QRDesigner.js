import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { 
  Upload, Download, Eye, Sparkles, X
} from 'lucide-react';

// List of available pre-loaded logos from your uploads
const PRELOADED_LOGOS = [
  { id: 'applemusic', name: 'Apple Music', filename: 'applemusic.png', path: '/assets/logos/applemusic.png' },
  { id: 'bitcoinsv', name: 'Bitcoin SV', filename: 'bitcoinsv.png', path: '/assets/logos/bitcoinsv.png' },
  { id: 'carrd', name: 'Carrd', filename: 'carrd.png', path: '/assets/logos/carrd.png' },
  { id: 'facebook', name: 'Facebook', filename: 'facebook.png', path: '/assets/logos/facebook.png' },
  { id: 'gmail', name: 'Gmail', filename: 'gmail.png', path: '/assets/logos/gmail.png' },
  { id: 'indeed', name: 'Indeed', filename: 'indeed.png', path: '/assets/logos/indeed.png' },
  { id: 'instagram', name: 'Instagram', filename: 'instagram.png', path: '/assets/logos/instagram.png' },
  { id: 'pinterest', name: 'Pinterest', filename: 'pinterest.png', path: '/assets/logos/pinterest.png' },
  { id: 'readthedocs', name: 'Read the Docs', filename: 'readthedocs.png', path: '/assets/logos/readthedocs.png' },
  { id: 'reddit', name: 'Reddit', filename: 'reddit.png', path: '/assets/logos/reddit.png' },
  { id: 'spotify', name: 'Spotify', filename: 'spotify.png', path: '/assets/logos/spotify.png' },
  { id: 'tiktok', name: 'TikTok', filename: 'tiktok.png', path: '/assets/logos/tiktok.png' },
  { id: 'unitednations', name: 'United Nations', filename: 'unitednations.png', path: '/assets/logos/unitednations.png' },
  { id: 'wechat', name: 'WeChat', filename: 'wechat.png', path: '/assets/logos/wechat.png' },
  { id: 'whatsapp', name: 'WhatsApp', filename: 'whatsapp.png', path: '/assets/logos/whatsapp.png' },
  { id: 'wikiquote', name: 'Wikiquote', filename: 'wikiquote.png', path: '/assets/logos/wikiquote.png' },
  { id: 'x', name: 'X (Twitter)', filename: 'x.png', path: '/assets/logos/x.png' },
  { id: 'youtube', name: 'YouTube', filename: 'youtube.png', path: '/assets/logos/youtube.png' }
];

// Default design templates
const getDefaultTemplates = () => {
  return {
    'simple': {
      name: 'Simple',
      foreground_color: '#000000',
      background_color: '#FFFFFF',
      pattern_style: 'square',
      error_correction: 'H',
      logo_type: 'none'
    },
    'instagram': {
      name: 'Instagram',
      foreground_color: '#E1306C',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      gradient_enabled: true,
      gradient_color1: '#F58529',
      gradient_color2: '#C13584',
      gradient_type: 'linear',
      gradient_direction: 'horizontal',
      logo_type: 'preloaded',
      template_logo: 'instagram'
    },
    'facebook': {
      name: 'Facebook',
      foreground_color: '#1877F2',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'facebook'
    },
    'twitter': {
      name: 'Twitter/X',
      foreground_color: '#000000',
      background_color: '#FFFFFF',
      pattern_style: 'circle',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'x'
    },
    'whatsapp': {
      name: 'WhatsApp',
      foreground_color: '#25D366',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'whatsapp'
    },
    'linkedin': {
      name: 'LinkedIn',
      foreground_color: '#0A66C2',
      background_color: '#FFFFFF',
      pattern_style: 'square',
      error_correction: 'H',
      logo_type: 'none'
    },
    'youtube': {
      name: 'YouTube',
      foreground_color: '#FF0000',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'youtube'
    },
    'spotify': {
      name: 'Spotify',
      foreground_color: '#1DB954',
      background_color: '#000000',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'spotify'
    },
    'tiktok': {
      name: 'TikTok',
      foreground_color: '#000000',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'tiktok'
    },
    'pinterest': {
      name: 'Pinterest',
      foreground_color: '#E60023',
      background_color: '#FFFFFF',
      pattern_style: 'circle',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'pinterest'
    },
    'reddit': {
      name: 'Reddit',
      foreground_color: '#FF4500',
      background_color: '#FFFFFF',
      pattern_style: 'circle',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'reddit'
    },
    'wifi': {
      name: 'WiFi',
      foreground_color: '#4285F4',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'none'
    },
    'email': {
      name: 'Email',
      foreground_color: '#EA4335',
      background_color: '#FFFFFF',
      pattern_style: 'rounded',
      error_correction: 'H',
      logo_type: 'none'
    },
    'phone': {
      name: 'Phone',
      foreground_color: '#34A853',
      background_color: '#FFFFFF',
      pattern_style: 'circle',
      error_correction: 'H',
      logo_type: 'none'
    },
    'location': {
      name: 'Location',
      foreground_color: '#EA4335',
      background_color: '#FFFFFF',
      pattern_style: 'circle',
      error_correction: 'H',
      logo_type: 'none'
    },
    'pdf': {
      name: 'PDF',
      foreground_color: '#F40F02',
      background_color: '#FFFFFF',
      pattern_style: 'square',
      error_correction: 'H',
      logo_type: 'none'
    },
    'bitcoin': {
      name: 'Bitcoin',
      foreground_color: '#F7931A',
      background_color: '#FFFFFF',
      pattern_style: 'square',
      error_correction: 'H',
      logo_type: 'preloaded',
      template_logo: 'bitcoinsv'
    },
    'website': {
      name: 'Website',
      foreground_color: '#4285F4',
      background_color: '#FFFFFF',
      pattern_style: 'square',
      error_correction: 'H',
      logo_type: 'none'
    }
  };
};

const QRDesigner = ({ user }) => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [templates, setTemplates] = useState(getDefaultTemplates());
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialDesignLoaded, setInitialDesignLoaded] = useState(false);
  
  const [design, setDesign] = useState({
    foreground_color: '#000000',
    background_color: '#FFFFFF',
    pattern_style: 'square',
    error_correction: 'H',
    gradient_enabled: false,
    gradient_color1: '#000000',
    gradient_color2: '#666666',
    gradient_type: 'linear',
    gradient_direction: 'horizontal',
    frame_style: 'none',
    frame_color: '#000000',
    frame_text: '',
    logo_data: null,
    logo_type: 'none',
    template_logo: null,
    custom_logo_url: null,
    icon_logo: null,
    template_key: null
  });

  // Ref to track if we should update preview
  const shouldUpdatePreview = useRef(true);
  const previewTimeoutRef = useRef(null);

  // Convert image file to base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const updatePreview = useCallback(async () => {
    if (!shouldUpdatePreview.current || !qrData?.signature) {
      return;
    }

    try {
      const sig = qrData.signature;
      const params = new URLSearchParams({
        sig: sig,
        t: Date.now(),
        fg: design.foreground_color.replace('#', ''),
        bg: design.background_color.replace('#', ''),
        style: design.pattern_style,
        ec: design.error_correction
      });

      // Add gradient parameters if enabled
      if (design.gradient_enabled) {
        params.append('gradient', 'true');
        params.append('g1', design.gradient_color1.replace('#', ''));
        params.append('g2', design.gradient_color2.replace('#', ''));
        params.append('gtype', design.gradient_type);
        params.append('gdir', design.gradient_direction);
      }

      // Add frame parameters
      if (design.frame_style !== 'none') {
        params.append('frame', design.frame_style);
        params.append('fc', design.frame_color.replace('#', ''));
        if (design.frame_text) {
          params.append('ftext', encodeURIComponent(design.frame_text));
        }
      }

      // Add logo parameters
      if (design.logo_type !== 'none') {
        params.append('logo', 'true');
        if (design.logo_type === 'preloaded' && design.template_logo) {
          params.append('logo_type', 'preloaded');
          params.append('logo_name', design.template_logo);
        } else if (design.logo_type === 'custom' && design.logo_data) {
          params.append('logo_type', 'custom');
          params.append('logo_data', encodeURIComponent(design.logo_data));
        }
      }

      // Add template key if exists
      if (design.template_key) {
        params.append('template_key', design.template_key);
      }

      const previewUrl = `${API}/public/qr/${qrId}/image?${params.toString()}`;
      setPreviewUrl(previewUrl);
      
    } catch (error) {
      console.error('Error updating preview:', error);
      setPreviewUrl(null);
    }
  }, [qrId, qrData, design]);

  const fetchQRCode = useCallback(async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/qr-codes/${qrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrData(response.data);
      
      // Get existing design from backend
      const existingDesign = response.data.design || {};
      
      // Create initial design object
      const initialDesign = {
        foreground_color: '#000000',
        background_color: '#FFFFFF',
        pattern_style: 'square',
        error_correction: 'H',
        gradient_enabled: false,
        gradient_color1: '#000000',
        gradient_color2: '#666666',
        gradient_type: 'linear',
        gradient_direction: 'horizontal',
        frame_style: 'none',
        frame_color: '#000000',
        frame_text: '',
        logo_data: null,
        logo_type: 'none',
        template_logo: null,
        custom_logo_url: null,
        icon_logo: null,
        template_key: null,
        ...existingDesign
      };
      
      // Set template key if exists in design
      if (initialDesign.template_key) {
        setSelectedTemplateKey(initialDesign.template_key);
      }
      
      // Handle custom logo URL
      if (initialDesign.logo_type === 'custom' && initialDesign.logo_data) {
        try {
          // For custom logos, we already have base64 in logo_data
          // No need to create object URL unless it's for preview only
          initialDesign.custom_logo_url = initialDesign.logo_data;
        } catch (error) {
          console.warn('Could not process custom logo:', error);
        }
      } else if (initialDesign.logo_type === 'preloaded' && initialDesign.template_logo) {
        const logoInfo = PRELOADED_LOGOS.find(logo => logo.id === initialDesign.template_logo);
        if (logoInfo) {
          initialDesign.custom_logo_url = logoInfo.path;
        }
      }
      
      // Set design without immediately triggering preview update
      shouldUpdatePreview.current = false;
      setDesign(initialDesign);
      setInitialDesignLoaded(true);
      
      // Load design templates from API
      try {
        const templatesRes = await axios.get(`${API}/design-templates`);
        if (templatesRes.data?.templates) {
          setTemplates(templatesRes.data.templates);
        }
      } catch (error) {
        console.warn('Using default templates:', error);
      }
      
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Failed to load QR code');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [qrId, navigate]);

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  useEffect(() => {
    if (!initialDesignLoaded) return;
    
    // Enable preview updates after initial load
    shouldUpdatePreview.current = true;
    
    // Clear any existing timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    // Debounce preview update
    previewTimeoutRef.current = setTimeout(() => {
      updatePreview();
    }, 300);
    
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [design, updatePreview, initialDesignLoaded]);

  const handleDesignChange = (key, value) => {
    setDesign(prev => {
      const newDesign = { ...prev, [key]: value };
      
      // If changing anything except template_key, clear template selection
      if (key !== 'template_key' && selectedTemplateKey) {
        setSelectedTemplateKey(null);
        newDesign.template_key = null;
      }
      
      return newDesign;
    });
  };

  const handleTemplateSelect = (templateKey) => {
    const template = templates[templateKey];
    if (template) {
      setSelectedTemplateKey(templateKey);
      
      // Create new design with template settings
      const newDesign = { 
        ...design,
        template_key: templateKey
      };
      
      // Apply all template properties (except name)
      Object.keys(template).forEach(key => {
        if (key !== 'name' && template[key] !== undefined) {
          newDesign[key] = template[key];
        }
      });
      
      // If template has preloaded logo, set the custom logo URL for preview
      if (template.logo_type === 'preloaded' && template.template_logo) {
        const logoInfo = PRELOADED_LOGOS.find(logo => logo.id === template.template_logo);
        if (logoInfo) {
          newDesign.custom_logo_url = logoInfo.path;
        }
      } else if (template.logo_type === 'none') {
        newDesign.custom_logo_url = null;
        newDesign.logo_data = null;
      }
      
      setDesign(newDesign);
      toast.success(`Applied ${template.name} template`);
    }
  };

  const handlePreloadedLogoSelect = (logoId) => {
    const logoInfo = PRELOADED_LOGOS.find(logo => logo.id === logoId);
    if (!logoInfo) return;

    setDesign(prev => ({
      ...prev,
      logo_type: 'preloaded',
      template_logo: logoId,
      logo_data: null,
      custom_logo_url: logoInfo.path,
      icon_logo: null,
      template_key: null
    }));
    
    setSelectedTemplateKey(null);
    toast.success(`Selected ${logoInfo.name} logo`);
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    try {
      const base64Logo = await imageToBase64(file);
      setDesign(prev => ({
        ...prev,
        logo_data: base64Logo,
        logo_type: 'custom',
        icon_logo: null,
        template_logo: null,
        custom_logo_url: base64Logo, // Use base64 for preview
        template_key: null
      }));
      setSelectedTemplateKey(null);
      toast.success('Custom logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleRemoveLogo = () => {
    setDesign(prev => ({
      ...prev,
      logo_data: null,
      logo_type: 'none',
      icon_logo: null,
      template_logo: null,
      custom_logo_url: null,
      template_key: null
    }));
    
    setSelectedTemplateKey(null);
    toast.success('Logo removed');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('session_token');
      
      // Prepare design for saving
      const designToSave = { ...design };
      
      // Remove preview-only properties
      delete designToSave.custom_logo_url;
      
      // If logo_type is custom and logo_data is base64, ensure it's properly formatted
      if (designToSave.logo_type === 'custom' && designToSave.logo_data) {
        // Ensure logo_data is a string
        if (typeof designToSave.logo_data !== 'string') {
          designToSave.logo_data = String(designToSave.logo_data);
        }
      }
      
      // If logo_type is none, clear logo-related fields
      if (designToSave.logo_type === 'none') {
        designToSave.logo_data = null;
        designToSave.template_logo = null;
        designToSave.icon_logo = null;
      }
      
      await axios.put(
        `${API}/qr-codes/${qrId}`,
        { design: designToSave },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('QR code design updated successfully!');
      
      // Update QR data to get new signature if needed
      const updatedResponse = await axios.get(`${API}/qr-codes/${qrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrData(updatedResponse.data);
      
      // Navigate back to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast.error('Failed to update design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up timeouts
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `qr-code-${qrId}-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    } else {
      toast.error('Preview not available for download');
    }
  };

  const getCurrentLogoDisplay = () => {
    if (design.logo_type === 'custom' && design.custom_logo_url) {
      return <img src={design.custom_logo_url} alt="Custom Logo" className="w-1/3 h-1/3 object-contain" />;
    } else if (design.logo_type === 'preloaded' && design.template_logo) {
      const logoInfo = PRELOADED_LOGOS.find(logo => logo.id === design.template_logo);
      if (logoInfo) {
        return (
          <div className="flex flex-col items-center">
            <img 
              src={logoInfo.path}
              alt={logoInfo.name}
              className="w-1/3 h-1/3 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/100x100/cccccc/666666?text=${logoInfo.name.charAt(0)}`;
              }}
            />
            <span className="text-xs mt-2 text-muted-foreground">{logoInfo.name}</span>
          </div>
        );
      }
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
    <div className="min-h-screen bg-background" data-testid="qr-designer-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading font-bold text-4xl" data-testid="designer-title">
              Design QR Code
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')} data-testid="cancel-button">
                Cancel
              </Button>
              <Button onClick={handleDownload} variant="outline" className="gap-2" data-testid="download-button">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleSave} className="gap-2 rounded-full" data-testid="save-button" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Design Controls */}
            <div className="space-y-6">
              <Card className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="logos">Logos</TabsTrigger>
                    <TabsTrigger value="frame">Frame</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  {/* Basic Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div>
                      <Label>Pattern Style</Label>
                      <Select 
                        value={design.pattern_style} 
                        onValueChange={(v) => handleDesignChange('pattern_style', v)}
                        data-testid="pattern-select"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="dots">Dots</SelectItem>
                          <SelectItem value="circle">Circles</SelectItem>
                          <SelectItem value="gapped">Gapped Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fg-color">Foreground Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="fg-color"
                            type="color"
                            value={design.foreground_color}
                            onChange={(e) => handleDesignChange('foreground_color', e.target.value)}
                            className="w-16 h-10"
                            data-testid="fg-color-input"
                          />
                          <Input
                            type="text"
                            value={design.foreground_color}
                            onChange={(e) => handleDesignChange('foreground_color', e.target.value)}
                            className="flex-1"
                            data-testid="fg-color-text"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bg-color">Background Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={design.background_color}
                            onChange={(e) => handleDesignChange('background_color', e.target.value)}
                            className="w-16 h-10"
                            data-testid="bg-color-input"
                          />
                          <Input
                            type="text"
                            value={design.background_color}
                            onChange={(e) => handleDesignChange('background_color', e.target.value)}
                            className="flex-1"
                            data-testid="bg-color-text"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Error Correction</Label>
                      <Select 
                        value={design.error_correction} 
                        onValueChange={(v) => handleDesignChange('error_correction', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (7%)</SelectItem>
                          <SelectItem value="M">Medium (15%)</SelectItem>
                          <SelectItem value="Q">Quartile (25%)</SelectItem>
                          <SelectItem value="H">High (30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Logos Tab */}
                  <TabsContent value="logos" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="logo-upload">Upload Custom Logo</Label>
                        <div className="mt-2">
                          <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <Upload className="h-5 w-5" />
                            <span>Click to upload custom logo</span>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {design.logo_type === 'custom' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full gap-2"
                            onClick={handleRemoveLogo}
                          >
                            <X className="h-4 w-4" />
                            Remove Custom Logo
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label>Pre-loaded Logos</Label>
                        <p className="text-sm text-muted-foreground mb-3">Select from our collection of logos</p>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1">
                          {PRELOADED_LOGOS.map((logo) => {
                            const isSelected = design.logo_type === 'preloaded' && design.template_logo === logo.id;
                            
                            return (
                              <button
                                key={logo.id}
                                onClick={() => handlePreloadedLogoSelect(logo.id)}
                                className={`flex flex-col items-center p-2 border rounded-lg hover:shadow-md transition-all ${
                                  isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border'
                                }`}
                                title={logo.name}
                                data-testid={`logo-${logo.id}`}
                              >
                                <div className="w-10 h-10 flex items-center justify-center mb-1 bg-white rounded">
                                  <img 
                                    src={logo.path}
                                    alt={logo.name}
                                    className="max-w-full max-h-full object-contain p-1"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://via.placeholder.com/40x40/cccccc/666666?text=${logo.name.charAt(0)}`;
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-medium truncate w-full text-center">
                                  {logo.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {design.logo_type === 'preloaded' && design.template_logo && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full gap-2"
                            onClick={handleRemoveLogo}
                          >
                            <X className="h-4 w-4" />
                            Remove Selected Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Frame Tab */}
                  <TabsContent value="frame" className="space-y-4 mt-4">
                    <div>
                      <Label>Frame Style</Label>
                      <Select 
                        value={design.frame_style} 
                        onValueChange={(v) => handleDesignChange('frame_style', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Frame</SelectItem>
                          <SelectItem value="square">Square Frame</SelectItem>
                          <SelectItem value="rounded">Rounded Frame</SelectItem>
                          <SelectItem value="circle">Circle Frame</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {design.frame_style !== 'none' && (
                      <>
                        <div>
                          <Label>Frame Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="color"
                              value={design.frame_color}
                              onChange={(e) => handleDesignChange('frame_color', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={design.frame_color}
                              onChange={(e) => handleDesignChange('frame_color', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="frame-text">Frame Text (Optional)</Label>
                          <Input
                            id="frame-text"
                            type="text"
                            value={design.frame_text}
                            onChange={(e) => handleDesignChange('frame_text', e.target.value)}
                            placeholder="Scan me"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Text will appear at the bottom of the frame
                          </p>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Templates Tab */}
                  <TabsContent value="templates" className="mt-4">
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {Object.entries(templates).map(([key, template]) => {
                        const hasLogo = template.logo_type === 'preloaded' && template.template_logo;
                        const logoInfo = hasLogo ? PRELOADED_LOGOS.find(logo => logo.id === template.template_logo) : null;
                        const isSelected = selectedTemplateKey === key;
                        
                        return (
                          <button
                            key={key}
                            onClick={() => handleTemplateSelect(key)}
                            className={`w-full p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all text-left ${
                              isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border'
                            }`}
                            data-testid={`template-${key}`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Template Preview */}
                              <div 
                                className="w-20 h-20 rounded-lg flex-shrink-0 relative overflow-hidden"
                                style={{ 
                                  backgroundColor: template.background_color,
                                  backgroundImage: template.gradient_enabled 
                                    ? `linear-gradient(${template.gradient_direction === 'horizontal' ? '90deg' : '0deg'}, ${template.gradient_color1}, ${template.gradient_color2})`
                                    : undefined
                                }}
                              >
                                {/* Mini QR Pattern */}
                                <div className="absolute inset-1 grid grid-cols-4 grid-rows-4 gap-0.5">
                                  {Array.from({ length: 16 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`
                                        ${template.pattern_style === 'rounded' ? 'rounded-[2px]' : ''}
                                        ${template.pattern_style === 'dots' || template.pattern_style === 'circle' ? 'rounded-full' : ''}
                                        ${template.pattern_style === 'gapped' ? 'm-0.5' : ''}
                                      `}
                                      style={{
                                        backgroundColor: template.foreground_color,
                                        opacity: (i % 5 === 0 || i === 0 || i === 15) ? 0.9 : 0.5
                                      }}
                                    />
                                  ))}
                                </div>
                                
                                {/* Template Logo Preview */}
                                {hasLogo && logoInfo && (
                                  <div className="absolute inset-0 flex items-center justify-center p-2">
                                    <img 
                                      src={logoInfo.path} 
                                      alt={logoInfo.name}
                                      className="w-10 h-10 object-contain"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {/* Template Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-base">{template.name}</h3>
                                  {hasLogo && logoInfo && (
                                    <div className="w-5 h-5 flex items-center justify-center bg-white rounded p-0.5">
                                      <img 
                                        src={logoInfo.path} 
                                        alt=""
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: template.foreground_color }} />
                                      <span className="text-xs">Foreground</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: template.background_color }} />
                                      <span className="text-xs">Background</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 rounded-sm border">
                                        <div className={`w-full h-full ${
                                          template.pattern_style === 'rounded' ? 'rounded-[2px]' :
                                          template.pattern_style === 'circle' ? 'rounded-full' :
                                          template.pattern_style === 'dots' ? 'rounded-full' : ''
                                        }`} 
                                        style={{ backgroundColor: template.foreground_color }}
                                        />
                                      </div>
                                      <span className="text-xs capitalize">{template.pattern_style}</span>
                                    </div>
                                  </div>
                                  
                                  {template.gradient_enabled && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-sm" style={{ 
                                        background: `linear-gradient(45deg, ${template.gradient_color1}, ${template.gradient_color2})`
                                      }} />
                                      <span className="text-xs">Gradient enabled</span>
                                    </div>
                                  )}
                                  
                                  {hasLogo && (
                                    <div className="text-xs flex items-center gap-1">
                                      <span>Includes:</span>
                                      <span className="font-medium">{logoInfo?.name || template.template_logo}</span>
                                      <span>logo</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="gradient-toggle">Gradient Effect</Label>
                        <p className="text-sm text-muted-foreground">
                          Apply gradient to QR code foreground
                        </p>
                      </div>
                      <Switch
                        id="gradient-toggle"
                        checked={design.gradient_enabled || false}
                        onCheckedChange={(checked) => {
                          handleDesignChange('gradient_enabled', checked);
                          if (!checked) {
                            handleDesignChange('gradient_color1', '#000000');
                            handleDesignChange('gradient_color2', '#666666');
                          }
                        }}
                      />
                    </div>

                    {design.gradient_enabled && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Gradient Color 1</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="color"
                                value={design.gradient_color1}
                                onChange={(e) => handleDesignChange('gradient_color1', e.target.value)}
                                className="w-16 h-10"
                              />
                              <Input
                                type="text"
                                value={design.gradient_color1}
                                onChange={(e) => handleDesignChange('gradient_color1', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Gradient Color 2</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="color"
                                value={design.gradient_color2}
                                onChange={(e) => handleDesignChange('gradient_color2', e.target.value)}
                                className="w-16 h-10"
                              />
                              <Input
                                type="text"
                                value={design.gradient_color2}
                                onChange={(e) => handleDesignChange('gradient_color2', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Gradient Type</Label>
                            <Select 
                              value={design.gradient_type} 
                              onValueChange={(v) => handleDesignChange('gradient_type', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="radial">Radial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {design.gradient_type === 'linear' && (
                            <div>
                              <Label>Gradient Direction</Label>
                              <Select 
                                value={design.gradient_direction} 
                                onValueChange={(v) => handleDesignChange('gradient_direction', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="horizontal">Horizontal</SelectItem>
                                <SelectItem value="vertical">Vertical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Current Design Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Current Design Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pattern:</span>
                  <span className="font-medium capitalize">{design.pattern_style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Foreground:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: design.foreground_color }} />
                    <span>{design.foreground_color}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: design.background_color }} />
                    <span>{design.background_color}</span>
                  </div>
                </div>
                {design.logo_type !== 'none' && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Logo:</span>
                    <div className="flex items-center gap-2">
                      {design.logo_type === 'custom' && (
                        <span className="font-medium">Custom Logo</span>
                      )}
                      {design.logo_type === 'preloaded' && design.template_logo && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={PRELOADED_LOGOS.find(l => l.id === design.template_logo)?.path || '/assets/logos/default.png'} 
                            alt="Logo" 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="font-medium">
                            {PRELOADED_LOGOS.find(l => l.id === design.template_logo)?.name || 'Logo'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedTemplateKey && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <span className="font-medium">{templates[selectedTemplateKey]?.name}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-2xl flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Live Preview
                </h2>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              
              <div className="aspect-square bg-secondary/20 rounded-xl flex items-center justify-center p-8 relative border border-border">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="QR Code Preview"
                      className="w-full h-full object-contain"
                      key={previewUrl}
                      data-testid="qr-preview-image"
                      onError={(e) => {
                        console.error('Preview image failed to load');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {/* Fallback QR Pattern Preview */}
                    <div 
                      className="w-full h-full rounded-lg relative"
                      style={{
                        backgroundColor: design.background_color,
                        backgroundImage: design.gradient_enabled 
                          ? `linear-gradient(${design.gradient_direction === 'horizontal' ? '90deg' : '0deg'}, ${design.gradient_color1}, ${design.gradient_color2})`
                          : undefined
                      }}
                    >
                      {/* QR Pattern Simulation */}
                      <div className="absolute inset-4 grid grid-cols-11 grid-rows-11 gap-1">
                        {Array.from({ length: 121 }).map((_, i) => (
                          <div
                            key={i}
                            className={`
                              ${design.pattern_style === 'rounded' ? 'rounded-[3px]' : ''}
                              ${design.pattern_style === 'dots' || design.pattern_style === 'circle' ? 'rounded-full' : ''}
                              ${design.pattern_style === 'gapped' ? 'm-0.5' : ''}
                            `}
                            style={{
                              backgroundColor: design.foreground_color,
                              opacity: Math.random() > 0.3 ? 0.9 : 0.3
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Center Logo Display */}
                      {getCurrentLogoDisplay()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Design Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">QR Code ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{qrId}</code>
                </div>
                
                {selectedTemplateKey && templates[selectedTemplateKey] && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Template:</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                      <span className="font-medium">{templates[selectedTemplateKey].name}</span>
                    </div>
                  </div>
                )}
                
                {design.logo_type === 'custom' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Logo:</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                      <Upload className="w-3 h-3" />
                      <span className="font-medium">Custom Upload</span>
                    </div>
                  </div>
                )}
                
                {design.logo_type === 'preloaded' && design.template_logo && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <img 
                      src={PRELOADED_LOGOS.find(l => l.id === design.template_logo)?.path || '/assets/logos/default.png'} 
                      alt="" 
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="font-medium">
                      {PRELOADED_LOGOS.find(l => l.id === design.template_logo)?.name || 'Preloaded Logo'}
                    </span>
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    {previewUrl 
                      ? '✨ Live preview updates as you customize. Click Save to apply changes.' 
                      : 'Preview shows current design. Changes are saved locally until you click Save.'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  </div>
  );
};

export default QRDesigner;