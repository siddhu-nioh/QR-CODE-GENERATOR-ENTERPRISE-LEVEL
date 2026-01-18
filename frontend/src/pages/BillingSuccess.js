import React, { useEffect, useState ,useCallback} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BillingSuccess = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);

  // useEffect(() => {
  //   if (!sessionId) {
  //     navigate('/billing');
  //     return;
  //   }

  //   checkPaymentStatus();
  // }, [sessionId, attempts]);
  const checkPaymentStatus = useCallback(async () => {
  if (attempts >= 5) {
    setStatus('timeout');
    return;
  }

  try {
    const token = localStorage.getItem('session_token');
    const response = await axios.get(
      `${API}/billing/status/${sessionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.payment_status === 'paid') {
      setStatus('success');
      toast.success('Payment successful!');
    } else if (response.data.status === 'expired') {
      setStatus('expired');
    } else {
      setTimeout(() => setAttempts(prev => prev + 1), 2000);
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    setStatus('error');
  }
}, [attempts, sessionId]);

useEffect(() => {
  if (!sessionId) {
    navigate('/billing');
    return;
  }

  checkPaymentStatus();
}, [sessionId, checkPaymentStatus, navigate]);

  // const checkPaymentStatus = async () => {
  //   if (attempts >= 5) {
  //     setStatus('timeout');
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem('session_token');
  //     const response = await axios.get(
  //       `${API}/billing/status/${sessionId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.data.payment_status === 'paid') {
  //       setStatus('success');
  //       toast.success('Payment successful!');
  //     } else if (response.data.status === 'expired') {
  //       setStatus('expired');
  //     } else {
  //       // Continue polling
  //       setTimeout(() => setAttempts(attempts + 1), 2000);
  //     }
  //   } catch (error) {
  //     console.error('Error checking payment status:', error);
  //     setStatus('error');
  //   }
  // };
  


  return (
    <div className="min-h-screen bg-background" data-testid="billing-success-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            {status === 'checking' && (
              <>
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                <h1 className="font-heading font-bold text-3xl mb-4">Processing Payment...</h1>
                <p className="text-muted-foreground">Please wait while we confirm your payment</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" data-testid="success-icon" />
                <h1 className="font-heading font-bold text-3xl mb-4" data-testid="success-title">Payment Successful!</h1>
                <p className="text-muted-foreground mb-8">Your subscription has been upgraded successfully</p>
                <Button onClick={() => navigate('/dashboard')} className="rounded-full" data-testid="go-dashboard-button">
                  Go to Dashboard
                </Button>
              </>
            )}

            {status === 'expired' && (
              <>
                <h1 className="font-heading font-bold text-3xl mb-4">Session Expired</h1>
                <p className="text-muted-foreground mb-8">Your payment session has expired. Please try again.</p>
                <Button onClick={() => navigate('/billing')} className="rounded-full">
                  Back to Billing
                </Button>
              </>
            )}

            {status === 'timeout' && (
              <>
                <h1 className="font-heading font-bold text-3xl mb-4">Check Timed Out</h1>
                <p className="text-muted-foreground mb-8">We couldn't verify your payment. Please check your email for confirmation.</p>
                <Button onClick={() => navigate('/dashboard')} className="rounded-full">
                  Go to Dashboard
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <h1 className="font-heading font-bold text-3xl mb-4">Error</h1>
                <p className="text-muted-foreground mb-8">There was an error processing your payment. Please contact support.</p>
                <Button onClick={() => navigate('/billing')} className="rounded-full">
                  Back to Billing
                </Button>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BillingSuccess;
