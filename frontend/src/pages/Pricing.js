import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, QrCode } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();
const location = useLocation();
  const plans = [
    {
      name: 'Free',
      price: '$0',
      qrs: '5 QR codes',
      features: ['Static QR only', 'PNG export', 'Watermark', 'Basic support'],
      cta: 'Get Started'
    },
    {
      name: 'Starter',
      price: '$9.99',
      qrs: '50 QR codes',
      features: ['Dynamic QR codes', 'Basic analytics', 'All export formats', 'Remove watermark'],
      cta: 'Start Free Trial'
    },
    {
      name: 'Pro',
      price: '$29.99',
      qrs: '500 QR codes',
      features: ['Everything in Starter', 'Advanced analytics', 'Logo upload', 'Custom frames', 'Priority support'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99.99',
      qrs: 'Unlimited',
      features: ['Everything in Pro', 'API access', 'White-label', 'Bulk operations', 'Dedicated support'],
      cta: 'Contact Sales'
    }
  ];


  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1); // Go back in history
    } else {
      navigate(fallbackPath); // Go to dashboard/home
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background" data-testid="pricing-page">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b glass">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <QrCode className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-xl">QRPlanet</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
            <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
            <Button onClick={() => navigate('/login')} className="rounded-full">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-heading font-bold text-5xl md:text-7xl tracking-tight leading-[1.1] mb-6" data-testid="pricing-title">
                Choose Your Plan
              </h1>
              <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground">
                Start free and scale as you grow
              </p>
            </div>
             <Button 
      variant="outline"
      onClick={handleBack}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>

            <div className="grid md:grid-cols-4 gap-6">
              {plans.map((plan, idx) => (
                <Card
                  key={idx}
                  className={`relative p-8 rounded-3xl border ${
                    plan.popular ? 'border-primary shadow-2xl scale-105' : 'border-border shadow-xl'
                  } hover:shadow-2xl transition-shadow`}
                  data-testid={`pricing-card-${plan.name.toLowerCase()}`}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}

                  <h3 className="font-heading font-bold text-2xl mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="font-heading font-bold text-4xl">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.qrs}</p>

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
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/login')}
                    data-testid={`pricing-cta-${plan.name.toLowerCase()}`}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              ))}
            </div>

            {/* FAQ or Additional Info */}
            <div className="mt-20 text-center">
              <h2 className="font-heading font-bold text-3xl mb-4">Need a custom plan?</h2>
              <p className="text-muted-foreground mb-8">
                Contact our sales team for enterprise pricing and custom solutions
              </p>
              <Button size="lg" variant="outline" className="rounded-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 QRPlanet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
