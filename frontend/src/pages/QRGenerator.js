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
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const QRGenerator = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qrType, setQrType] = useState('url');
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

    try {
      const token = localStorage.getItem('session_token');

      await axios.post(
        `${API}/qr-codes`,
        {
          name,
          qr_type: qrType,
          content
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('QR code created successfully');
      navigate('/dashboard');
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
              value={content.url || ''}
              onChange={(e) => setContent({ url: e.target.value })}
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
              value={content.text || ''}
              onChange={(e) => setContent({ text: e.target.value })}
              required
            />
          </>
        );

      case 'email':
        return (
          <>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="contact@example.com"
              value={content.email || ''}
              onChange={(e) =>
                setContent({ ...content, email: e.target.value })
              }
              required
            />
          </>
        );

      case 'phone':
        return (
          <>
            <Label>Phone</Label>
            <Input
              placeholder="+1234567890"
              value={content.phone || ''}
              onChange={(e) => setContent({ phone: e.target.value })}
              required
            />
          </>
        );

      case 'wifi':
        return (
          <>
            <Label>SSID</Label>
            <Input
              value={content.ssid || ''}
              onChange={(e) =>
                setContent({ ...content, ssid: e.target.value })
              }
              required
            />
            <Label>Password</Label>
            <Input
              type="password"
              value={content.password || ''}
              onChange={(e) =>
                setContent({ ...content, password: e.target.value })
              }
              required
            />
          </>
        );

      case 'location':
        return (
          <>
            <Label>Latitude</Label>
            <Input
              value={content.latitude || ''}
              onChange={(e) =>
                setContent({ ...content, latitude: e.target.value })
              }
              required
            />
            <Label>Longitude</Label>
            <Input
              value={content.longitude || ''}
              onChange={(e) =>
                setContent({ ...content, longitude: e.target.value })
              }
              required
            />
          </>
        );

      case 'payment':
        return (
          <>
            <Label>Payment URL</Label>
            <Input
              value={content.payment_url || ''}
              onChange={(e) =>
                setContent({ payment_url: e.target.value })
              }
              required
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto py-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Create QR Code</h1>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>QR Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>QR Type</Label>
              <Select
                value={qrType}
                onValueChange={(val) => {
                  setQrType(val);
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

            {/* Dynamic Info (Backend Controlled) */}
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div>
                <Label className="font-semibold">Dynamic QR</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.plan === 'free'
                    ? 'Upgrade to Pro to enable dynamic QR codes'
                    : 'Dynamic QR is enabled automatically for your plan'}
                </p>
              </div>
              <Switch checked={user?.plan !== 'free'} disabled />
            </div>

            <div className="space-y-4">{renderContentFields()}</div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create QR'}
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
      </main>
    </div>
  );
};

export default QRGenerator;
