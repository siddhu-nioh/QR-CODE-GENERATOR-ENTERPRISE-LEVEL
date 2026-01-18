import React, { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, Crown } from 'lucide-react';
import { toast } from 'sonner';

const Billing = ({ user }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName) => {
    if (planName === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    try {
      const token = localStorage.getItem('session_token');
      const originUrl = window.location.origin;
      
      const response = await axios.post(
        `${API}/billing/checkout`,
        {
          plan_name: planName,
          origin_url: originUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout');
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
    <div className="min-h-screen bg-background" data-testid="billing-page">
      <Navbar user={user} />

      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl mb-4" data-testid="billing-title">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground">Current plan: <span className="font-semibold text-primary capitalize" data-testid="current-plan">{user?.plan}</span></p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <Card
                key={plan.plan_name}
                className={`relative p-8 rounded-3xl border ${
                  plan.plan_name === 'pro' ? 'border-primary shadow-2xl scale-105' : 'border-border shadow-xl'
                } hover:shadow-2xl transition-shadow`}
                data-testid={`plan-${plan.plan_name}`}
              >
                {plan.plan_name === 'pro' && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Popular
                  </div>
                )}

                <h3 className="font-heading font-bold text-2xl mb-2 capitalize">{plan.plan_name}</h3>
                <div className="mb-4">
                  <span className="font-heading font-bold text-4xl">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <p className="text-muted-foreground mb-6">
                  {plan.qr_limit === -1 ? 'Unlimited' : plan.qr_limit} QR codes
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full rounded-full"
                  variant={plan.plan_name === user?.plan ? 'outline' : plan.plan_name === 'pro' ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.plan_name)}
                  disabled={plan.plan_name === user?.plan}
                  data-testid={`upgrade-${plan.plan_name}-button`}
                >
                  {plan.plan_name === user?.plan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Billing;
