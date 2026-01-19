import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  HelpCircle, Search, BookOpen, MessageSquare, 
  Video, Mail, FileQuestion, Settings,
  Smartphone, Download, Printer, Globe,
  Shield, Clock, Users, CheckCircle
} from 'lucide-react';

const HelpPage = ({user}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
    { id: 'qr-creation', name: 'QR Creation', icon: Settings },
    { id: 'design', name: 'Design & Customization', icon: Download },
    { id: 'analytics', name: 'Analytics', icon: Globe },
    { id: 'billing', name: 'Billing & Plans', icon: Shield },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: FileQuestion },
  ];

  const popularArticles = [
    { title: 'How to create your first QR code', category: 'getting-started', readTime: '3 min' },
    { title: 'Changing QR code colors and adding logos', category: 'design', readTime: '5 min' },
    { title: 'Understanding QR code analytics', category: 'analytics', readTime: '7 min' },
    { title: 'Dynamic vs Static QR codes', category: 'qr-creation', readTime: '4 min' },
    { title: 'Troubleshooting scanning issues', category: 'troubleshooting', readTime: '6 min' },
    { title: 'Upgrading your plan', category: 'billing', readTime: '3 min' },
  ];

  const faqs = [
    { question: 'Do QR codes expire?', answer: 'Static QR codes never expire. Dynamic QR codes in free accounts have scanning limits but remain active in paid plans.' },
    { question: 'Can I edit my QR code after printing?', answer: 'Yes, with dynamic QR codes. You can change the destination URL without reprinting the QR code.' },
    { question: 'What file formats can I download?', answer: 'You can download QR codes as PNG, JPG, SVG, EPS, and PDF formats for different use cases.' },
    { question: 'Is there a limit to how many QR codes I can create?', answer: 'Free accounts can create unlimited static QR codes. Dynamic QR codes have limits based on your plan.' },
    { question: 'How do I track QR code scans?', answer: 'Log in to your dashboard and click on any QR code to view detailed analytics including scan counts, locations, and devices.' },
    { question: 'Can I add my logo to QR codes?', answer: 'Yes! All plans allow logo uploads. Premium plans offer more customization options.' },
  ];

  const contactOptions = [
    { icon: Mail, title: 'Email Support', desc: 'support@qrplanet.com', details: 'Typically respond within 24 hours' },
    { icon: MessageSquare, title: 'Live Chat', desc: 'Available 9am-6pm EST', details: 'For immediate assistance' },
    { icon: Video, title: 'Video Tutorials', desc: 'Watch step-by-step guides', details: 'Self-paced learning' },
  ];

  return (
    <div className="min-h-screen py-12">
            <Navbar user={user} />
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <HelpCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How can we help you?</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions, learn how to use QRPlanet, or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for articles, guides, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-lg border flex flex-col items-center transition-all duration-200 ${
                  activeCategory === category.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'hover:border-primary hover:shadow-md'
                }`}
              >
                <category.icon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Popular Articles</h2>
            <Button variant="outline">View all articles →</Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="px-2 py-1 bg-primary/10 rounded text-primary">
                    {article.category.replace('-', ' ')}
                  </span>
                  <span>•</span>
                  <span>{article.readTime} read</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{article.title}</h3>
                <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary">
                  Read article →
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <FileQuestion className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold mb-6">Quick Start Guide</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold mb-2">Create a QR Code</h3>
                <p className="text-muted-foreground text-sm">Choose your QR type and enter the content</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold mb-2">Customize Design</h3>
                <p className="text-muted-foreground text-sm">Add colors, logo, and adjust the style</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold mb-2">Download & Share</h3>
                <p className="text-muted-foreground text-sm">Download in your preferred format and use it</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Options */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">Still need help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <option.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{option.title}</h3>
                <p className="text-lg mb-1">{option.desc}</p>
                <p className="text-sm text-muted-foreground">{option.details}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;