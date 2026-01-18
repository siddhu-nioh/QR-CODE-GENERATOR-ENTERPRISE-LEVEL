import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

const QRDesigner = ({ user }) => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [design, setDesign] = useState({
    foreground_color: '#000000',
    background_color: '#FFFFFF'
  });

  // useEffect(() => {
  //   fetchQRCode();
  // }, [qrId]);

  useEffect(() => {
  fetchQRCode();
}, [fetchQRCode]);

  // const fetchQRCode = async () => {
  //   try {
  //     const token = localStorage.getItem('session_token');
  //     const response = await axios.get(`${API}/qr-codes/${qrId}`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setQrData(response.data);
  //     if (response.data.design) {
  //       setDesign(response.data.design);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching QR code:', error);
  //     toast.error('Failed to load QR code');
  //     navigate('/dashboard');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchQRCode = useCallback(async () => {
  try {
    const token = localStorage.getItem('session_token');

    const response = await axios.get(
      `${API}/qr-codes/${qrId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setQrData(response.data);

    if (response.data.design) {
      setDesign(response.data.design);
    }
  } catch (error) {
    console.error('Error fetching QR code:', error);
    toast.error('Failed to load QR code');
    navigate('/dashboard');
  } finally {
    setLoading(false);
  }
}, [qrId, navigate]);

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
        <div className="max-w-6xl mx-auto">
          <h1 className="font-heading font-bold text-4xl mb-8" data-testid="designer-title">Design QR Code</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Design Controls */}
            <Card className="p-8">
              <h2 className="font-heading font-semibold text-2xl mb-6">Customize Design</h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="fg-color">Foreground Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="fg-color"
                      type="color"
                      value={design.foreground_color}
                      onChange={(e) => setDesign({ ...design, foreground_color: e.target.value })}
                      className="w-20 h-11"
                      data-testid="fg-color-input"
                    />
                    <Input
                      type="text"
                      value={design.foreground_color}
                      onChange={(e) => setDesign({ ...design, foreground_color: e.target.value })}
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
                      onChange={(e) => setDesign({ ...design, background_color: e.target.value })}
                      className="w-20 h-11"
                      data-testid="bg-color-input"
                    />
                    <Input
                      type="text"
                      value={design.background_color}
                      onChange={(e) => setDesign({ ...design, background_color: e.target.value })}
                      className="flex-1"
                      data-testid="bg-color-text"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button onClick={handleSave} className="flex-1 rounded-full" data-testid="save-button">Save Changes</Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')} data-testid="cancel-button">Cancel</Button>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-8 sticky top-24">
              <h2 className="font-heading font-semibold text-2xl mb-6">Preview</h2>
              <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center p-8">
                <div
                  className="w-full h-full rounded-lg"
                  style={{
                    backgroundColor: design.background_color,
                    backgroundImage: `
                      repeating-linear-gradient(0deg, ${design.foreground_color} 0px, ${design.foreground_color} 10px, transparent 10px, transparent 20px),
                      repeating-linear-gradient(90deg, ${design.foreground_color} 0px, ${design.foreground_color} 10px, transparent 10px, transparent 20px)
                    `
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">This is a simplified preview. Download to see the actual QR code.</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRDesigner;
