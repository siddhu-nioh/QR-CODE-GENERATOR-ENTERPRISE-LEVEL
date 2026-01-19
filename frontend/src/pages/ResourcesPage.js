import React from 'react';
import { Card } from '../components/ui/card';
import { BookOpen, FileQuestion, BarChart3, Gift, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ResourcesPage = ({user}) => {
  const resources = [
    { icon: BookOpen, title: 'Blog', desc: 'Read our latest articles on QR code trends' },
    { icon: FileQuestion, title: 'Help Center', desc: 'Find answers to common questions' },
    { icon: BarChart3, title: 'Case Studies', desc: 'See how businesses use our platform' },
    { icon: Gift, title: 'Free Tools', desc: 'Additional utilities for QR codes' },
    { icon: Users, title: 'Community', desc: 'Join our user community' },
  ];

  return (
    <div className="min-h-screen py-12">
            <Navbar user={user} />
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Resources</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {resources.map((resource, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <resource.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-muted-foreground">{resource.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;