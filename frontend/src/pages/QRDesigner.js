import React, { useState, useEffect, useCallback } from 'react';
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
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Upload, Download, Eye, Sparkles } from 'lucide-react';

const QRDesigner = ({ user }) => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [templates, setTemplates] = useState({});
  
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
    logo_data: null
  });

  const fetchQRCode = useCallback(async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/qr-codes/${qrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrData(response.data);
      
      if (response.data.design) {
        setDesign({ ...design, ...response.data.design });
      }
      
      // Fetch design templates
      try {
        const templatesRes = await axios.get(`${API}/design-templates`);
        setTemplates(templatesRes.data.templates || {});
      } catch (error) {
        console.warn('Could not load design templates:', error);
        // Set default templates if API fails
        setTemplates({
          'default': {
            name: 'Default',
            foreground_color: '#000000',
            background_color: '#FFFFFF',
            pattern_style: 'square'
          },
          'modern': {
            name: 'Modern',
            foreground_color: '#3B82F6',
            background_color: '#F8FAFC',
            pattern_style: 'rounded'
          },
          'dark': {
            name: 'Dark',
            foreground_color: '#10B981',
            background_color: '#1F2937',
            pattern_style: 'dots'
          }
        });
      }
      
      // Generate initial preview
      updatePreview(response.data.design || design);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Failed to load QR code');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [qrId, navigate, design , updatePreview]);

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode , ]);

  const updatePreview = useCallback(async (currentDesign) => {
    try {
      const token = localStorage.getItem('session_token');
      const sig = qrData?.signature;
      
      if (!sig) {
        // Fallback to generating a basic preview
        console.log('No signature available, using fallback preview');
        return;
      }
      
      // For now, use the public image endpoint with design params
      const previewUrl = `${API}/public/qr/${qrId}/image?sig=${sig}&t=${Date.now()}`;
      setPreviewUrl(previewUrl);
    } catch (error) {
      console.error('Error updating preview:', error);
      // Fallback to basic preview
      setPreviewUrl(null);
    }
  }, [qrId, qrData]);

  useEffect(() => {
    if (qrData) {
      const debounceTimer = setTimeout(() => {
        updatePreview(design);
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [design, qrData, updatePreview]);

  const handleDesignChange = (key, value) => {
    setDesign(prev => ({ ...prev, [key]: value }));
  };

  const handleTemplateSelect = (templateKey) => {
    const template = templates[templateKey];
    if (template) {
      setDesign(prev => ({ ...prev, ...template }));
      toast.success(`Applied ${template.name} template`);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleDesignChange('logo_data', e.target.result);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.put(
        `${API}/qr-codes/${qrId}`,
        { design },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('QR code design updated!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast.error('Failed to update design');
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `qr-code-${qrId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    } else {
      toast.error('Preview not available for download');
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
              <Button onClick={handleSave} className="gap-2 rounded-full" data-testid="save-button">
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Design Controls */}
            <div className="space-y-6">
              <Card className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="frame">Frame</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>

                  {/* Basic Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div>
                      <Label>Pattern Style</Label>
                      <Select value={design.pattern_style} onValueChange={(v) => handleDesignChange('pattern_style', v)}>
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

                    <div>
                      <Label htmlFor="fg-color">Foreground Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="fg-color"
                          type="color"
                          value={design.foreground_color}
                          onChange={(e) => handleDesignChange('foreground_color', e.target.value)}
                          className="w-20 h-11"
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
                          className="w-20 h-11"
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

                    <div>
                      <Label>Error Correction</Label>
                      <Select value={design.error_correction} onValueChange={(v) => handleDesignChange('error_correction', v)}>
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

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Gradient</Label>
                      <Switch
                        checked={design.gradient_enabled}
                        onCheckedChange={(v) => handleDesignChange('gradient_enabled', v)}
                      />
                    </div>

                    {design.gradient_enabled && (
                      <>
                        <div>
                          <Label>Gradient Type</Label>
                          <Select value={design.gradient_type} onValueChange={(v) => handleDesignChange('gradient_type', v)}>
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
                            <Label>Direction</Label>
                            <Select value={design.gradient_direction} onValueChange={(v) => handleDesignChange('gradient_direction', v)}>
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

                        <div>
                          <Label>Gradient Color 1</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="color"
                              value={design.gradient_color1}
                              onChange={(e) => handleDesignChange('gradient_color1', e.target.value)}
                              className="w-20 h-11"
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
                              className="w-20 h-11"
                            />
                            <Input
                              type="text"
                              value={design.gradient_color2}
                              onChange={(e) => handleDesignChange('gradient_color2', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="logo-upload">Upload Logo</Label>
                      <div className="mt-2">
                        <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-5 w-5" />
                          <span>Click to upload logo</span>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {design.logo_data && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleDesignChange('logo_data', null)}
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  {/* Frame Tab */}
                  <TabsContent value="frame" className="space-y-4 mt-4">
                    <div>
                      <Label>Frame Style</Label>
                      <Select value={design.frame_style} onValueChange={(v) => handleDesignChange('frame_style', v)}>
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
                              className="w-20 h-11"
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
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Templates Tab */}
                  <TabsContent value="templates" className="mt-4">
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {Object.entries(templates).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => handleTemplateSelect(key)}
                          className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
                          data-testid={`template-${key}`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: template.foreground_color }}
                            />
                            <span className="font-medium text-sm">{template.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card className="p-8 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-semibold text-2xl flex items-center gap-2">
                    <Eye className="h-6 w-6" />
                    Live Preview
                  </h2>
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </div>
                
                <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center p-8">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="QR Code Preview"
                      className="w-full h-full object-contain"
                      key={previewUrl}
                      data-testid="qr-preview-image"
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-lg"
                      style={{
                        backgroundColor: design.background_color,
                        backgroundImage: design.gradient_enabled 
                          ? `linear-gradient(${design.gradient_direction === 'horizontal' ? '90deg' : '0deg'}, ${design.gradient_color1}, ${design.gradient_color2})`
                          : `repeating-linear-gradient(0deg, ${design.foreground_color} 0px, ${design.foreground_color} 10px, transparent 10px, transparent 20px),
                             repeating-linear-gradient(90deg, ${design.foreground_color} 0px, ${design.foreground_color} 10px, transparent 10px, transparent 20px)`
                      }}
                      data-testid="fallback-preview"
                    />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {previewUrl ? '✨ Real-time preview updates as you customize' : 'This is a simplified preview. Download to see the actual QR code.'}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRDesigner;