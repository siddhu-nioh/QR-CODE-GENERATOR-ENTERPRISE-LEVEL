import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Shield, Lock, Eye, Database, Globe, Users,
  CheckCircle, FileText, Server, Key, AlertTriangle,
  ShieldCheck, Download, Upload, Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const SecurityPage = ({user}) => {
  const navigate = useNavigate();

  const securityFeatures = [
    { 
      icon: Shield, 
      title: 'GDPR Compliance', 
      desc: 'Full compliance with EU General Data Protection Regulation',
      details: 'We don\'t process personal data without explicit user consent'
    },
    { 
      icon: Lock, 
      title: 'Data Encryption', 
      desc: 'End-to-end encryption for all sensitive data',
      details: 'AES-256 encryption for data in transit and at rest'
    },
    { 
      icon: Database, 
      title: 'Data Minimization', 
      desc: 'Collect only what\'s necessary for service operation',
      details: 'We minimize data collection and retention periods'
    },
    { 
      icon: Users, 
      title: 'Access Control', 
      desc: 'Role-based access control for team accounts',
      details: 'Fine-grained permissions for different team members'
    },
    { 
      icon: Server, 
      title: 'Secure Infrastructure', 
      desc: 'Enterprise-grade cloud infrastructure',
      details: 'Hosted on AWS with regular security audits'
    },
    { 
      icon: Globe, 
      title: 'Global Standards', 
      desc: 'Compliant with international security standards',
      details: 'Follows ISO 27001 and SOC 2 Type II principles'
    },
  ];

  const privacyPrinciples = [
    { icon: CheckCircle, text: 'Transparent data usage policies' },
    { icon: CheckCircle, text: 'User control over personal data' },
    { icon: CheckCircle, text: 'Regular security assessments' },
    { icon: CheckCircle, text: 'No selling of user data' },
    { icon: CheckCircle, text: 'Clear cookie consent management' },
    { icon: CheckCircle, text: 'Data breach notification procedures' },
  ];

  const certifications = [
    { name: 'GDPR Compliant', status: 'Certified', color: 'bg-green-100 text-green-800' },
    { name: 'ISO 27001', status: 'Aligned', color: 'bg-blue-100 text-blue-800' },
    { name: 'SOC 2 Type II', status: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'CCPA Compliant', status: 'Certified', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="min-h-screen py-12">
            <Navbar user={user} />
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Security & Privacy</h1>
          <p className="text-xl text-muted-foreground">
            Your trust is our top priority. We implement industry-leading security measures
            to protect your data and ensure compliance with global privacy regulations.
          </p>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Security Measures</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.desc}</p>
                <p className="text-sm text-muted-foreground/80">{feature.details}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Certifications & Compliance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={index} className="p-6 text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium mb-4 ${cert.color}`}>
                  {cert.status}
                </div>
                <h3 className="font-semibold">{cert.name}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy Principles */}
        <div className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-3xl font-bold mb-8 text-center">Privacy Principles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {privacyPrinciples.map((principle, index) => (
                <div key={index} className="flex items-center gap-3 p-4">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{principle.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Data Protection */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-6">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Data Protection</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Regular vulnerability assessments and penetration testing</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Multi-factor authentication for all employee accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Automatic security updates and patch management</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>24/7 security monitoring and incident response</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-6">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Your Data Rights</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Right to access your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Right to data portability and export</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Right to request data deletion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Right to object to data processing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Right to correct inaccurate data</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* CTA & Contact */}
        <div className="text-center">
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5">
            <h2 className="text-3xl font-bold mb-6">Have Security Questions?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our security team is available to answer any questions about our
              security practices, compliance, or data protection measures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/contact')}>
                Contact Security Team
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/help')}>
                Security FAQ
              </Button>
            </div>
          </Card>
        </div>

        {/* Legal Documents */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4 text-center">Legal Documents</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Privacy Policy
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Terms of Service
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Cookie Policy
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Data Processing Agreement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;