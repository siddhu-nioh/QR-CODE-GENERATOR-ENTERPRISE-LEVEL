import React, { useState, useEffect ,useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Plus, QrCode as QrCodeIcon, BarChart, Download, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
 const [loadedImages, setLoadedImages] = useState({});



  const fetchQRCodes = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/qr-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCodes(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchQRCodes();
  }, []);
  const handleDelete = async (qrId) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      const token = localStorage.getItem('session_token');
      await axios.delete(`${API}/qr-codes/${qrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('QR code deleted');
      fetchQRCodes();
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
    }
  };


  const refreshUser = async () => {
  const res = await axios.get(`${API}/auth/me`, {
  });
  setUser(res.data); // whatever state holds logged-in user
};

useEffect(() => {
  refreshUser();
}, []);


  const handleDownload = async (qrId, name) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/public/qr/${qr.qr_id}/image?sig=${qr.signature}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const canCreateMore = user?.plan === 'free' ? qrCodes.length < 5 : true;

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl mb-2" data-testid="dashboard-title">My QR Codes</h1>
            <p className="text-muted-foreground" data-testid="qr-count">
              {qrCodes.length} {user?.plan === 'free' ? '/ 5' : ''} QR codes created
            </p>
          </div>
          <Button
            onClick={() => navigate('/generator')}
            disabled={!canCreateMore}
            className="rounded-full"
            data-testid="create-qr-button"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New QR Code
          </Button>
        </div>

        {/* Limit Warning */}
        {user?.plan === 'free' && qrCodes.length >= 5 && (
          <Card className="p-4 mb-8 bg-destructive/10 border-destructive/20" data-testid="limit-warning">
            <p className="text-sm">
              You've reached the free plan limit (5 QR codes). 
              <Button variant="link" className="px-2" onClick={() => navigate('/billing')}>Upgrade to Pro</Button>
              to create unlimited QR codes.
            </p>
          </Card>
        )}

        {/* QR Codes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : qrCodes.length === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-state">
            <QrCodeIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl mb-2">No QR codes yet</h3>
            <p className="text-muted-foreground mb-6">Create your first QR code to get started</p>
            <Button onClick={() => navigate('/generator')} data-testid="empty-create-button">
              <Plus className="mr-2 h-5 w-5" />
              Create QR Code
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr) => (
              <Card key={qr.qr_id} className="p-6 hover:shadow-lg transition-shadow" data-testid={`qr-card-${qr.qr_id}`}>
                {/* <div className="aspect-square bg-secondary rounded-lg mb-4 flex items-center justify-center">
                  <QrCodeIcon className="h-24 w-24 text-muted-foreground" />
                </div> */}

                <div className="relative aspect-square bg-secondary rounded-lg mb-4 flex items-center justify-center overflow-hidden">
  {/* Placeholder */}
  {!loadedImages[qr.qr_id] && (
    <QrCodeIcon className="h-20 w-20 text-muted-foreground animate-pulse absolute" />
  )}

  {/* Actual QR Image */}
  <img
    src={`${API}/public/qr/${qr.qr_id}/image?sig=${qr.signature}`}
    alt={qr.name}
    onLoad={() =>
      setLoadedImages(prev => ({ ...prev, [qr.qr_id]: true }))
    }
    className={`w-full h-full object-contain transition-opacity duration-300 ${
      loadedImages[qr.qr_id] ? 'opacity-100' : 'opacity-0'
    }`}
  />
</div>

                <h3 className="font-heading font-semibold text-lg mb-2" data-testid={`qr-name-${qr.qr_id}`}>{qr.name}</h3>
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <span className="capitalize">{qr.qr_type}</span>
                  {qr.is_dynamic && (
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-semibold">Dynamic</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Scans: <span className="font-semibold text-foreground" data-testid={`qr-scans-${qr.qr_id}`}>{qr.scan_count}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(qr.qr_id, qr.name)} data-testid={`download-button-${qr.qr_id}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {qr.is_dynamic && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/analytics/${qr.qr_id}`)} data-testid={`analytics-button-${qr.qr_id}`}>
                      <BarChart className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => navigate(`/designer/${qr.qr_id}`)} data-testid={`edit-button-${qr.qr_id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(qr.qr_id)} data-testid={`delete-button-${qr.qr_id}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
