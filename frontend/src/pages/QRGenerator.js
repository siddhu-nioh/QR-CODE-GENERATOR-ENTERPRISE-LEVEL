import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Link, Mail, Phone, MessageSquare, Wifi, User, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const QRGenerator = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qrType, setQrType] = useState('url');
  const [isDynamic, setIsDynamic] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState({});

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
    { value: 'payment', label: 'Payment', icon: CreditCard }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (user?.plan === 'free' && isDynamic) {
      toast.error('Dynamic QR codes require a paid plan');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.post(
        `${API}/qr-codes`,
        {
          name,
          qr_type: qrType,
          content,
          is_dynamic: isDynamic
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('QR code created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast.error(error.response?.data?.detail || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const renderContentFields = () => {
    switch (qrType) {
      case 'url':
        return (
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={content.url || ''}
              onChange={(e) => setContent({ url: e.target.value })}
              required
              data-testid="url-input"
            />
          </div>
        );
      case 'text':
        return (
          <div>
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              placeholder="Enter your text here..."
              value={content.text || ''}
              onChange={(e) => setContent({ text: e.target.value })}
              required
              data-testid="text-input"
            />
          </div>
        );
      case 'email':
        return (
          <>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={content.email || ''}
                onChange={(e) => setContent({ ...content, email: e.target.value })}
                required
                data-testid="email-input"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={content.subject || ''}
                onChange={(e) => setContent({ ...content, subject: e.target.value })}
                data-testid="subject-input"
              />
            </div>
          </>
        );
      case 'phone':
        return (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1234567890"
              value={content.phone || ''}
              onChange={(e) => setContent({ phone: e.target.value })}
              required
              data-testid="phone-input"
            />
          </div>
        );
      case 'sms':
        return (
          <>
            <div>
              <Label htmlFor="sms-phone">Phone Number</Label>
              <Input
                id="sms-phone"
                placeholder="+1234567890"
                value={content.phone || ''}
                onChange={(e) => setContent({ ...content, phone: e.target.value })}
                required
                data-testid="sms-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Your message here"
                value={content.message || ''}
                onChange={(e) => setContent({ ...content, message: e.target.value })}
                data-testid="sms-message-input"
              />
            </div>
          </>
        );
      case 'whatsapp':
        return (
          <>
            <div>
              <Label htmlFor="whatsapp-phone">WhatsApp Number</Label>
              <Input
                id="whatsapp-phone"
                placeholder="1234567890"
                value={content.phone || ''}
                onChange={(e) => setContent({ ...content, phone: e.target.value })}
                required
                data-testid="whatsapp-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp-message">Message (optional)</Label>
              <Textarea
                id="whatsapp-message"
                placeholder="Pre-filled message"
                value={content.message || ''}
                onChange={(e) => setContent({ ...content, message: e.target.value })}
                data-testid="whatsapp-message-input"
              />
            </div>
          </>
        );
      case 'wifi':
        return (
          <>
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                placeholder="My WiFi"
                value={content.ssid || ''}
                onChange={(e) => setContent({ ...content, ssid: e.target.value })}
                required
                data-testid="ssid-input"
              />
            </div>
            <div>
              <Label htmlFor="wifi-password">Password</Label>
              <Input
                id="wifi-password"
                type="password"
                placeholder="WiFi password"
                value={content.password || ''}
                onChange={(e) => setContent({ ...content, password: e.target.value })}
                required
                data-testid="wifi-password-input"
              />
            </div>
            <div>
              <Label htmlFor="encryption">Encryption</Label>
              <Select value={content.encryption || 'WPA'} onValueChange={(val) => setContent({ ...content, encryption: val })}>
                <SelectTrigger data-testid="encryption-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'vcard':
        return (
          <>
            <div>
              <Label htmlFor="vcard-name">Full Name</Label>
              <Input
                id="vcard-name"
                placeholder="John Doe"
                value={content.name || ''}
                onChange={(e) => setContent({ ...content, name: e.target.value })}
                required
                data-testid="vcard-name-input"
              />
            </div>
            <div>
              <Label htmlFor="vcard-phone">Phone</Label>
              <Input
                id="vcard-phone"
                placeholder="+1234567890"
                value={content.phone || ''}
                onChange={(e) => setContent({ ...content, phone: e.target.value })}
                data-testid="vcard-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="vcard-email">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                placeholder="john@example.com"
                value={content.email || ''}
                onChange={(e) => setContent({ ...content, email: e.target.value })}
                data-testid="vcard-email-input"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company Name"
                value={content.company || ''}
                onChange={(e) => setContent({ ...content, company: e.target.value })}
                data-testid="vcard-company-input"
              />
            </div>
          </>
        );
      case 'location':
        return (
          <>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                placeholder="37.7749"
                value={content.latitude || ''}
                onChange={(e) => setContent({ ...content, latitude: e.target.value })}
                required
                data-testid="latitude-input"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                placeholder="-122.4194"
                value={content.longitude || ''}
                onChange={(e) => setContent({ ...content, longitude: e.target.value })}
                required
                data-testid="longitude-input"
              />
            </div>
          </>
        );
      case 'payment':
        return (
          <div>
            <Label htmlFor="payment-url">Payment URL</Label>
            <Input
              id="payment-url"
              placeholder="https://paypal.me/username"
              value={content.payment_url || ''}
              onChange={(e) => setContent({ payment_url: e.target.value })}
              required
              data-testid="payment-url-input"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="qr-generator-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading font-bold text-4xl mb-8" data-testid="generator-title">Create QR Code</h1>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* QR Name */}
              <div>
                <Label htmlFor="qr-name">QR Code Name</Label>
                <Input
                  id="qr-name"
                  placeholder="My QR Code"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="qr-name-input"
                />
              </div>

              {/* QR Type Selection */}
              <div>
                <Label htmlFor="qr-type">QR Code Type</Label>
                <Select value={qrType} onValueChange={(val) => { setQrType(val); setContent({}); }}>
                  <SelectTrigger id="qr-type" data-testid="qr-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qrTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="dynamic-toggle" className="text-base font-semibold">Dynamic QR Code</Label>
                  <p className="text-sm text-muted-foreground">Edit destination anytime (Pro feature)</p>
                </div>
                <Switch
                  id="dynamic-toggle"
                  checked={isDynamic}
                  onCheckedChange={setIsDynamic}
                  disabled={user?.plan === 'free'}
                  data-testid="dynamic-toggle"
                />
              </div>

              {/* Content Fields */}
              <div className="space-y-4">
                {renderContentFields()}
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 rounded-full" disabled={loading} data-testid="create-button">
                  {loading ? 'Creating...' : 'Create QR Code'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} data-testid="cancel-button">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default QRGenerator;
