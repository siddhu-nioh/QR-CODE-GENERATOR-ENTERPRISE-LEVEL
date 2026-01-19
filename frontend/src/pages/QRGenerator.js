import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import {
  Link,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  User,
  MapPin,
  CreditCard,
  Music,
  Video,
  Globe,
  Calendar,
  Palette,
  Sparkles,
  Eye,
  Upload,
  Building,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

const QRGenerator = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDesign, setShowDesign] = useState(false);
  const [qrType, setQrType] = useState('url');
  const [name, setName] = useState('');
  
  // Initialize content matching BACKEND field names
  const [content, setContent] = useState({
    url: '',
    text: '',
    email: '',
    subject: '',
    body: '',
    phone: '',
    message: '', // For SMS
    whatsapp_phone: '',
    whatsapp_message: '',
    ssid: '',
    password: '',
    encryption: 'WPA',
    first_name: '',
    last_name: '',
    company: '',
    title: '',
    email_vcard: '',
    phone_vcard: '',
    website: '',
    address: '',
    latitude: '',
    longitude: '',
    payment_url: '',
    amount: '',
    currency: 'USD',
    bitcoin_address: '',
    bitcoin_amount: '',
    mp3_url: '',
    artist: '',
    album: '',
    meeting_url: '',
    meeting_id: '',
    meeting_password: '',
    event_title: '',
    event_description: '',
    event_location: '',
    event_start: '',
    event_end: '',
    wifi_hidden: false
  });

  const qrTypes = [
    { value: 'url', label: 'URL / Website', icon: Link },
    { value: 'text', label: 'Plain Text', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'vcard', label: 'Business Card', icon: User },
    { value: 'location', label: 'Location', icon: MapPin },
    { value: 'payment', label: 'Payment', icon: CreditCard },
    { value: 'mp3', label: 'MP3 / Audio', icon: Music },
    { value: 'meeting', label: 'Zoom/Meeting', icon: Video },
    { value: 'bitcoin', label: 'Bitcoin', icon: Globe },
    { value: 'event', label: 'Event', icon: Calendar }
  ];

  // Design state
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

  const handleDesignChange = (key, value) => {
    setDesign(prev => ({ ...prev, [key]: value }));
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

  const updateContent = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('session_token');

      // Filter content to match BACKEND expectations
      const filteredContent = {};
      
      switch(qrType) {
        case 'url':
          filteredContent.url = content.url;
          break;
          
        case 'text':
          filteredContent.text = content.text;
          break;
          
        case 'email':
          filteredContent.email = content.email;
          filteredContent.subject = content.subject || '';
          filteredContent.body = content.body || '';
          break;
          
        case 'phone':
          filteredContent.phone = content.phone;
          break;
          
        case 'sms':
          // Your backend expects 'phone' and 'message' fields for SMS
          filteredContent.phone = content.phone;
          filteredContent.message = content.message || '';
          break;
          
        case 'whatsapp':
          filteredContent.phone = content.whatsapp_phone;
          filteredContent.message = content.whatsapp_message || '';
          break;
          
        case 'wifi':
          filteredContent.ssid = content.ssid;
          filteredContent.password = content.password;
          filteredContent.encryption = content.encryption || 'WPA';
          break;
          
        case 'vcard':
          // Combine first and last name for backend 'name' field
          const fullName = `${content.first_name || ''} ${content.last_name || ''}`.trim();
          filteredContent.name = fullName;
          filteredContent.phone = content.phone_vcard;
          filteredContent.email = content.email_vcard;
          filteredContent.company = content.company || '';
          filteredContent.website = content.website || '';
          break;
          
        case 'location':
          filteredContent.latitude = content.latitude;
          filteredContent.longitude = content.longitude;
          break;
          
        case 'payment':
          filteredContent.payment_url = content.payment_url;
          break;
          
        case 'mp3':
          filteredContent.url = content.mp3_url; // Your backend uses 'url' for MP3
          break;
          
        case 'meeting':
          filteredContent.url = content.meeting_url; // Your backend uses 'url' for meeting
          break;
          
        case 'bitcoin':
          filteredContent.url = `bitcoin:${content.bitcoin_address}${content.bitcoin_amount ? `?amount=${content.bitcoin_amount}` : ''}`;
          break;
          
        case 'event':
          // For event, might need to format as URL or text
          const eventText = `${content.event_title}\n${content.event_description || ''}\nLocation: ${content.event_location || ''}\nStart: ${content.event_start}\nEnd: ${content.event_end || ''}`;
          filteredContent.text = eventText;
          break;
          
        default:
          filteredContent.url = content.url;
      }

      const response = await axios.post(
        `${API}/qr-codes`,
        {
          name,
          qr_type: qrType,
          content: filteredContent,
          design: showDesign ? design : null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('QR code created successfully!');
      
      if (showDesign) {
        navigate(`/designer/${response.data.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const renderContentFields = () => {
    switch (qrType) {
      case 'url':
        return (
          <>
            <Label>URL</Label>
            <Input
              placeholder="https://example.com"
              value={content.url}
              onChange={(e) => updateContent('url', e.target.value)}
              required
            />
          </>
        );

      case 'text':
        return (
          <>
            <Label>Text</Label>
            <Textarea
              placeholder="Enter your text"
              value={content.text}
              onChange={(e) => updateContent('text', e.target.value)}
              rows={4}
              required
            />
          </>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="contact@example.com"
                value={content.email}
                onChange={(e) => updateContent('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Subject (Optional)</Label>
              <Input
                placeholder="Email subject"
                value={content.subject}
                onChange={(e) => updateContent('subject', e.target.value)}
              />
            </div>
            <div>
              <Label>Body (Optional)</Label>
              <Textarea
                placeholder="Email body text"
                value={content.body}
                onChange={(e) => updateContent('body', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <>
            <Label>Phone Number</Label>
            <Input
              placeholder="+1234567890"
              value={content.phone}
              onChange={(e) => updateContent('phone', e.target.value)}
              required
            />
          </>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+1234567890"
                value={content.phone}
                onChange={(e) => updateContent('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Your SMS message"
                value={content.message}
                onChange={(e) => updateContent('message', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+1234567890"
                value={content.whatsapp_phone}
                onChange={(e) => updateContent('whatsapp_phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Your WhatsApp message"
                value={content.whatsapp_message}
                onChange={(e) => updateContent('whatsapp_message', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <Label>Network Name (SSID)</Label>
              <Input
                placeholder="MyWiFiNetwork"
                value={content.ssid}
                onChange={(e) => updateContent('ssid', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="WiFi password"
                value={content.password}
                onChange={(e) => updateContent('password', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Encryption Type</Label>
              <Select
                value={content.encryption || 'WPA'}
                onValueChange={(val) => updateContent('encryption', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={content.first_name}
                onChange={(e) => updateContent('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={content.last_name}
                onChange={(e) => updateContent('last_name', e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Company (Optional)</Label>
              <Input
                value={content.company}
                onChange={(e) => updateContent('company', e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={content.email_vcard}
                onChange={(e) => updateContent('email_vcard', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={content.phone_vcard}
                onChange={(e) => updateContent('phone_vcard', e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Website (Optional)</Label>
              <Input
                value={content.website}
                onChange={(e) => updateContent('website', e.target.value)}
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input
                placeholder="40.7128"
                value={content.latitude}
                onChange={(e) => updateContent('latitude', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                placeholder="-74.0060"
                value={content.longitude}
                onChange={(e) => updateContent('longitude', e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">
                Example: 40.7128 (NYC Latitude), -74.0060 (NYC Longitude)
              </p>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <Label>Payment URL</Label>
              <Input
                placeholder="https://paypal.me/yourname"
                value={content.payment_url}
                onChange={(e) => updateContent('payment_url', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 'mp3':
        return (
          <div className="space-y-4">
            <div>
              <Label>MP3 File URL</Label>
              <Input
                placeholder="https://example.com/song.mp3"
                value={content.mp3_url}
                onChange={(e) => updateContent('mp3_url', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 'meeting':
        return (
          <div className="space-y-4">
            <div>
              <Label>Meeting URL</Label>
              <Input
                placeholder="https://zoom.us/j/123456789"
                value={content.meeting_url}
                onChange={(e) => updateContent('meeting_url', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 'bitcoin':
        return (
          <div className="space-y-4">
            <div>
              <Label>Bitcoin Address</Label>
              <Input
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                value={content.bitcoin_address}
                onChange={(e) => updateContent('bitcoin_address', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Amount (Optional, in BTC)</Label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.001"
                value={content.bitcoin_amount}
                onChange={(e) => updateContent('bitcoin_amount', e.target.value)}
              />
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={content.event_title}
                onChange={(e) => updateContent('event_title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={content.event_description}
                onChange={(e) => updateContent('event_description', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Location (Optional)</Label>
              <Input
                value={content.event_location}
                onChange={(e) => updateContent('event_location', e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={content.event_start}
                  onChange={(e) => updateContent('event_start', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>End Date & Time (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={content.event_end}
                  onChange={(e) => updateContent('event_end', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Select a QR type to see specific options
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto py-10 max-w-6xl">
        <h1 className="text-4xl font-bold mb-6">Create QR Code</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: QR Creation Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>QR Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My QR Code"
                  required
                />
              </div>

              <div>
                <Label>QR Type</Label>
                <Select
                  value={qrType}
                  onValueChange={(val) => {
                    setQrType(val);
                    // Reset content when changing QR type
                    setContent({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qrTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex gap-2 items-center">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold text-lg">{qrTypes.find(t => t.value === qrType)?.label} Details</h3>
                {renderContentFields()}
              </div>

              {/* Design Toggle */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="font-semibold text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Design Customization
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Customize colors, patterns, and add logos
                    </p>
                  </div>
                  <Switch
                    checked={showDesign}
                    onCheckedChange={setShowDesign}
                  />
                </div>

                {showDesign && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Foreground Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={design.foreground_color}
                            onChange={(e) => handleDesignChange('foreground_color', e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={design.foreground_color}
                            onChange={(e) => handleDesignChange('foreground_color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Background Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={design.background_color}
                            onChange={(e) => handleDesignChange('background_color', e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={design.background_color}
                            onChange={(e) => handleDesignChange('background_color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Pattern Style</Label>
                      <Select
                        value={design.pattern_style}
                        onValueChange={(v) => handleDesignChange('pattern_style', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="dots">Dots</SelectItem>
                          <SelectItem value="circle">Circles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="logo-upload">Add Logo (Optional)</Label>
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
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1 gap-2">
                  <Sparkles className="h-4 w-4" />
                  {loading ? 'Creating...' : showDesign ? 'Create & Customize' : 'Create QR'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          {/* Right Column: Preview */}
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
                {qrType ? (
                  <div className="w-full h-full rounded-lg flex flex-col items-center justify-center p-4">
                    <div 
                      className="w-48 h-48 rounded-lg mb-4"
                      style={{
                        backgroundColor: design.background_color,
                        backgroundImage: design.gradient_enabled 
                          ? `linear-gradient(${design.gradient_direction === 'horizontal' ? '90deg' : '0deg'}, ${design.gradient_color1}, ${design.gradient_color2})`
                          : undefined
                      }}
                    >
                      {/* Simulated QR code pattern */}
                      <div className="w-full h-full relative">
                        {[...Array(25)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute rounded-sm"
                            style={{
                              backgroundColor: design.foreground_color,
                              width: '12px',
                              height: '12px',
                              borderRadius: design.pattern_style === 'rounded' ? '4px' : 
                                         design.pattern_style === 'dots' ? '50%' : '0px',
                              top: `${Math.floor(i / 5) * 24 + 12}px`,
                              left: `${(i % 5) * 24 + 12}px`,
                            }}
                          />
                        ))}
                        {design.logo_data && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold">Logo</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{name || 'Your QR Code'}</p>
                      <p className="text-sm text-muted-foreground">
                        {qrTypes.find(t => t.value === qrType)?.label}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a QR type to see preview</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRGenerator;