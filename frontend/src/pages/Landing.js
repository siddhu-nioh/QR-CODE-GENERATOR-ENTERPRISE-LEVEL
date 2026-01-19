import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { QrCode, Zap, BarChart3, Palette, Download, Shield, ArrowRight, Check, Link as LinkIcon, Mail, Phone, MessageSquare, Wifi, User, FileText, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TrustedByCarousel from '@/components/TrustedByCarousel';

const Landing = ({user}) => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const qrTypes = [
    { id: 'link', icon: LinkIcon, title: 'URL', description: 'Link to websites' },
    { id: 'vcard', icon: User, title: 'vCard', description: 'Contact details' },
    { id: 'wifi', icon: Wifi, title: 'WiFi', description: 'Network credentials' },
    { id: 'email', icon: Mail, title: 'Email', description: 'Send email' },
    { id: 'sms', icon: MessageSquare, title: 'SMS', description: 'Text message' },
    { id: 'phone', icon: Phone, title: 'Phone', description: 'Make a call' },
    { id: 'text', icon: FileText, title: 'Text', description: 'Plain text' },
    { id: 'location', icon: MapPin, title: 'Location', description: 'GPS coordinates' },
  ];

  const features = [
    { icon: QrCode, title: 'Multiple QR Types', description: 'URL, vCard, WiFi, Email, SMS, WhatsApp & more' },
    { icon: Zap, title: 'Dynamic QR Codes', description: 'Edit destination anytime without reprinting' },
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Track scans, locations, devices in real-time' },
    { icon: Palette, title: 'Custom Design', description: 'Colors, gradients, logos, patterns, frames' },
    { icon: Download, title: 'Multiple Formats', description: 'PNG, SVG, PDF, EPS exports (RGB & CMYK)' },
    { icon: Shield, title: 'Enterprise Ready', description: 'Secure, scalable, GDPR-compliant' }
  ];

  const plans = [
    { 
      name: 'Free', 
      price: '$0', 
      qrs: '5 Static QR codes', 
      features: [
        'Static QR codes only',
        'PNG export',
        'Basic customization',
        'Watermark included',
        'Community support'
      ], 
      cta: 'Get Started',
      popular: false
    },
    { 
      name: 'Starter', 
      price: '$9.99', 
      qrs: '50 QR codes', 
      features: [
        'Dynamic QR codes',
        'Basic analytics',
        'All export formats (PNG, SVG, PDF)',
        'No watermark',
        'Email support'
      ], 
      cta: 'Start Free Trial', 
      popular: false
    },
    { 
      name: 'Pro', 
      price: '$29.99', 
      qrs: '500 QR codes', 
      features: [
        'Everything in Starter',
        'Advanced analytics & tracking',
        'Logo upload',
        'Custom design templates',
        'Priority support'
      ], 
      cta: 'Start Free Trial', 
      popular: true
    },
    { 
      name: 'Enterprise', 
      price: '$99.99', 
      qrs: 'Unlimited QR codes', 
      features: [
        'Everything in Pro',
        'White-label solution',
        'API access',
        'Batch generation',
        'Dedicated support'
      ], 
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const exampleQRs = [
    {
      name: 'Instagram',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      description: 'Social media QR with branded colors'
    },
    {
      name: 'WiFi',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      description: 'Quick WiFi connection for guests'
    },
    {
      name: 'vCard',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      description: 'Digital business card'
    },
    {
      name: 'Restaurant Menu',
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      description: 'Contactless menu access'
    },
    {
      name: 'Event Ticket',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      description: 'Digital event entry'
    },
    {
      name: 'App Download',
      color: 'bg-gradient-to-br from-teal-500 to-blue-500',
      description: 'Direct app store link'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'QRPlanet transformed our marketing campaigns. The analytics are incredible!'
    },
    {
      name: 'Michael Chen',
      role: 'Restaurant Owner',
      company: 'Bistro Delights',
      content: 'Our customers love the contactless menu. Setup was super easy.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Event Coordinator',
      company: 'EventPro',
      content: 'Dynamic QR codes saved us when we needed to change venue details last minute.'
    }
  ];

  const companyLogos = [
    { name: 'McDonald\'s', alt: 'McDonalds' },
    { name: 'Uber', alt: 'Uber' },
    { name: 'Walmart', alt: 'Walmart' },
    { name: 'Toyota', alt: 'Toyota' },
    { name: 'Starbucks', alt: 'Starbucks' },
    { name: 'Nike', alt: 'Nike' }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextExample = () => {
    setCurrentExample((prev) => (prev + 1) % exampleQRs.length);
  };

  const prevExample = () => {
    setCurrentExample((prev) => (prev - 1 + exampleQRs.length) % exampleQRs.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background" data-testid="landing-page">
      {/* Header */}
      {/* <header className="sticky top-0 z-50 border-b backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <QrCode className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-xl">QRPlanet</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/pricing')} data-testid="pricing-link">Pricing</Button>
            <Button variant="outline" onClick={() => navigate('/login')} data-testid="login-button">Log In</Button>
            <Button onClick={() => navigate('/login')} className="rounded-full" data-testid="signup-button">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header> */}
 <Navbar user={user}  />
      {/* Hero Section */}
      <section className="py-20 md:py-32" data-testid="hero-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading font-bold text-5xl md:text-7xl tracking-tight leading-[1.1] mb-6" data-testid="hero-title">
                Create <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600">Beautiful</span> QR Codes in Seconds
              </h1>
              <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground mb-8" data-testid="hero-description">
                Generate, customize, and track professional QR codes for your business. Dynamic codes, real-time analytics, and unlimited design possibilities.
              </p>
              <div className="flex gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="rounded-full h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" 
                  onClick={() => navigate('/login')} 
                  data-testid="hero-cta-button"
                >
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full h-12 px-8" 
                  onClick={() => navigate('/pricing')} 
                  data-testid="hero-pricing-button"
                >
                  View Pricing
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                ✓ No credit card required &nbsp;&nbsp; ✓ 5 free QR codes &nbsp;&nbsp; ✓ No expiration
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, delay: 0.2 }} 
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <QrCode className="w-full h-full text-primary opacity-80 relative z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QR Type Tabs */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading font-semibold text-3xl md:text-4xl mb-4">
                Choose Your QR Code Type
              </h2>
              <p className="text-muted-foreground">Support for all major QR code formats</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {qrTypes.map((type, idx) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-3 text-center hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-sm mb-1">{type.title}</h3>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* QR Examples Carousel */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading font-semibold text-3xl md:text-4xl mb-4">
                Stunning QR Code Examples
              </h2>
              <p className="text-muted-foreground">See what you can create with QRPlanet</p>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExample}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="p-12"
                  >
                    <Card className={`${exampleQRs[currentExample].color} p-16 text-white`}>
                      <div className="text-center">
                        <div className="w-64 h-64 mx-auto bg-white/90 rounded-2xl mb-8 flex items-center justify-center">
                          <QrCode className="w-48 h-48 text-gray-800" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{exampleQRs[currentExample].name}</h3>
                        <p className="text-white/90">{exampleQRs[currentExample].description}</p>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={prevExample}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition-transform"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextExample}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition-transform"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {exampleQRs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentExample(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentExample ? 'bg-primary w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-secondary/20" data-testid="features-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading font-semibold text-3xl md:text-5xl tracking-tight mb-4">
                Everything You Need
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Powerful features for modern QR code management
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: idx * 0.1 }} 
                    viewport={{ once: true }}
                  >
                    <Card className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-background to-secondary/20 p-8 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl">
                      <Icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-heading font-semibold text-xl mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      {/* <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-8">
              TRUSTED BY LEADING BRANDS WORLDWIDE
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-50">
              {companyLogos.map((logo, idx) => (
                <div key={idx} className="text-center">
                  <div className="font-bold text-lg">{logo.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}
      <TrustedByCarousel/>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading font-semibold text-3xl md:text-4xl mb-4">
                What Our Customers Say
              </h2>
              <p className="text-muted-foreground">Join thousands of satisfied users</p>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 md:p-12 text-center">
                    <p className="text-lg md:text-xl text-muted-foreground mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div>
                      <p className="font-semibold text-lg">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition-transform"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition-transform"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentTestimonial ? 'bg-primary w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32" data-testid="pricing-preview-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading font-semibold text-3xl md:text-5xl tracking-tight mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Choose the perfect plan for your needs
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: idx * 0.1 }} 
                  viewport={{ once: true }}
                >
                  <Card className={`relative p-6 rounded-3xl border ${
                    plan.popular 
                      ? 'border-primary shadow-2xl scale-105 bg-gradient-to-b from-primary/5 to-transparent' 
                      : 'border-border shadow-xl'
                  } hover:shadow-2xl transition-all h-full flex flex-col`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-heading font-bold text-2xl mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="font-heading font-bold text-4xl">{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-6">{plan.qrs}</p>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className={`w-full rounded-full ${plan.popular ? '' : 'variant-outline'}`}
                      variant={plan.popular ? 'default' : 'outline'} 
                      onClick={() => navigate('/login')} 
                      data-testid={`plan-${plan.name.toLowerCase()}-button`}
                    >
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
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/20 via-purple-600/20 to-pink-600/20" data-testid="cta-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading font-bold text-4xl md:text-6xl mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of businesses using QRPlanet to connect with customers
            </p>
            <Button 
              size="lg" 
              className="rounded-full h-12 px-8 shadow-lg shadow-primary/20" 
              onClick={() => navigate('/login')} 
              data-testid="cta-button"
            >
              Create Your First QR Code <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free plan available
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 QRPlanet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
