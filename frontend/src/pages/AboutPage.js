import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Target, Globe, Award, TrendingUp, Heart, Clock, Shield, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const AboutPage = ({user}) => {
  const navigate = useNavigate();
  
  const stats = [
    { value: '10M+', label: 'QR Codes Created', icon: TrendingUp },
    { value: '50K+', label: 'Happy Customers', icon: Users },
    { value: '150+', label: 'Countries Served', icon: Globe },
    { value: '99.9%', label: 'Uptime', icon: Zap }
  ];

  const team = [
    { name: 'Alex Johnson', role: 'CEO & Founder', bio: '10+ years in digital marketing', imgColor: 'bg-blue-100' },
    { name: 'Maria Garcia', role: 'CTO', bio: 'Former Google engineer', imgColor: 'bg-green-100' },
    { name: 'David Chen', role: 'Head of Design', bio: 'Award-winning UX designer', imgColor: 'bg-purple-100' },
    { name: 'Sarah Miller', role: 'Customer Success', bio: 'Helping customers since 2018', imgColor: 'bg-pink-100' }
  ];

  const values = [
    { icon: Heart, title: 'Customer First', desc: 'We prioritize user experience above all' },
    { icon: Shield, title: 'Security & Privacy', desc: 'GDPR compliant with enterprise-grade security' },
    { icon: Zap, title: 'Innovation', desc: 'Constantly improving and adding new features' },
    { icon: Users, title: 'Collaboration', desc: 'Teamwork makes the dream work' },
    { icon: Clock, title: 'Reliability', desc: '99.9% uptime guaranteed' },
    { icon: Star, title: 'Excellence', desc: 'Striving for perfection in every detail' }
  ];

  return (
    <div className="min-h-screen py-12">
            <Navbar user={user} />
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About QRPlanet</h1>
          <p className="text-xl text-muted-foreground">
            We're on a mission to make QR codes beautiful, functional, and accessible for everyone.
            Since 2018, we've helped businesses of all sizes connect with their audiences through
            smart QR code solutions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="text-muted-foreground text-lg">
              To democratize QR code technology by providing enterprise-grade features
              at affordable prices, making digital connections seamless for everyone.
            </p>
          </Card>
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
            <p className="text-muted-foreground text-lg">
              A world where every physical object can connect to digital experiences
              through beautiful, functional QR codes that enhance human interactions.
            </p>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-xl transition-all duration-300">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 ${member.imgColor} flex items-center justify-center text-3xl font-bold`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5">
            <h2 className="text-3xl font-bold mb-6">Ready to Join Us?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're looking to create your first QR code or scale your business,
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
                Get Started Free
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;