import React from 'react';
import { Card } from './ui/card';
import { BarChart3, ImageIcon, Settings, Shield, Zap, Globe, Users, Bell } from 'lucide-react';

const FeaturesPage = ({user}) => {
  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      desc: 'Track scans in real-time with detailed insights',
      items: ['Real-time scan tracking', 'Geographic location data', 'Device and browser stats', 'Time-based analytics']
    },
    {
      icon: ImageIcon,
      title: 'Custom Design',
      desc: 'Make QR codes that match your brand',
      items: ['Custom colors and gradients', 'Logo embedding', 'Frame and style options', 'Pattern customization']
    },
    {
      icon: Settings,
      title: 'Dynamic QR Codes',
      desc: 'Edit content without reprinting',
      items: ['Change destination URL', 'Update contact information', 'Schedule content changes', 'A/B testing']
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      desc: 'Enterprise-grade security features',
      items: ['GDPR compliance', 'Password protection', 'Scan limit controls', 'Domain whitelisting']
    },
    {
      icon: Zap,
      title: 'High Performance',
      desc: 'Lightning fast generation and scanning',
      items: ['Sub-second generation', '99.9% uptime', 'Global CDN', 'Bulk creation']
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      desc: 'Work together on QR campaigns',
      items: ['Team management', 'Role-based access', 'Shared templates', 'Collaborative editing']
    }
  ];

  return (
    <div className="min-h-screen py-12">
            <Navbar user={user} />
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">Features</h1>
        <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-12">
          Everything you need to create, manage, and track QR codes at scale
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;