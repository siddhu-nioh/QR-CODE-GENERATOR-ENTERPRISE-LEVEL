import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { QrCode, Zap, BarChart3, Palette, Download, Shield, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: QrCode, title: 'Multiple QR Types', description: 'URL, vCard, WiFi, Email, SMS, WhatsApp & more' },
    { icon: Zap, title: 'Dynamic QR Codes', description: 'Edit destination anytime without reprinting' },
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Track scans, locations, devices in real-time' },
    { icon: Palette, title: 'Custom Design', description: 'Colors, logos, patterns, frames & more' },
    { icon: Download, title: 'Multiple Formats', description: 'PNG, SVG, PDF exports for any use case' },
    { icon: Shield, title: 'Enterprise Ready', description: 'Secure, scalable, reliable infrastructure' }
  ];

  const plans = [
    { name: 'Free', price: '$0', qrs: '5 QR codes', features: ['Static QR only', 'PNG export', 'Basic support'], cta: 'Get Started' },
    { name: 'Pro', price: '$29.99', qrs: '500 QR codes', features: ['Dynamic QR', 'Analytics', 'All exports', 'Logo upload'], cta: 'Start Free Trial', popular: true },
    { name: 'Enterprise', price: '$99.99', qrs: 'Unlimited', features: ['Everything in Pro', 'API access', 'White-label', 'Priority support'], cta: 'Contact Sales' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background" data-testid="landing-page">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b glass">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-xl">QRPlanet</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/pricing')} data-testid="pricing-link">Pricing</Button>
            <Button variant="outline" onClick={() => navigate('/login')} data-testid="login-button">Log In</Button>
            <Button onClick={() => navigate('/login')} className="rounded-full" data-testid="signup-button">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32" data-testid="hero-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="font-heading font-bold text-5xl md:text-7xl tracking-tight leading-[1.1] mb-6" data-testid="hero-title">
                Create <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Beautiful</span> QR Codes in Seconds
              </h1>
              <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground mb-8" data-testid="hero-description">
                Generate, customize, and track professional QR codes for your business. Dynamic codes, analytics, and unlimited possibilities.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="rounded-full h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" onClick={() => navigate('/login')} data-testid="hero-cta-button">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8" onClick={() => navigate('/pricing')} data-testid="hero-pricing-button">
                  View Pricing
                </Button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center p-12">
                <QrCode className="w-full h-full text-primary opacity-80" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-secondary/20" data-testid="features-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading font-semibold text-3xl md:text-5xl tracking-tight mb-4">Everything You Need</h2>
              <p className="text-base md:text-lg text-muted-foreground">Powerful features for modern QR code management</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }}>
                  <Card className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-background to-secondary/20 p-8 hover:border-primary/50 transition-all hover:-translate-y-1">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="font-heading font-semibold text-xl mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 md:py-32" data-testid="pricing-preview-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading font-semibold text-3xl md:text-5xl tracking-tight mb-4">Simple, Transparent Pricing</h2>
              <p className="text-base md:text-lg text-muted-foreground">Choose the perfect plan for your needs</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }}>
                  <Card className={`relative p-8 rounded-3xl border ${
                    plan.popular ? 'border-primary shadow-2xl scale-105' : 'border-border shadow-xl'
                  } hover:shadow-2xl transition-shadow`}>
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
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full rounded-full" variant={plan.popular ? 'default' : 'outline'} onClick={() => navigate('/login')} data-testid={`plan-${plan.name.toLowerCase()}-button`}>
                      {plan.cta}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/20 via-purple-600/20 to-primary/20" data-testid="cta-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading font-bold text-4xl md:text-6xl mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">Join thousands of businesses using QRPlanet</p>
            <Button size="lg" className="rounded-full h-12 px-8 shadow-lg shadow-primary/20" onClick={() => navigate('/login')} data-testid="cta-button">
              Create Your First QR Code <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 QRPlanet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
