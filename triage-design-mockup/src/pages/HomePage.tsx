import { ShimmerButton } from '../components/ui/shimmer-button';
import { Marquee } from '../components/ui/marquee';
import { DotPattern } from '../components/ui/dot-pattern';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart3, ClipboardCheck, Database, Timer, ArrowRight, Sparkles, Home, FileText, Hammer, FolderOpen, Palette, Settings } from 'lucide-react';
import { EditableHomePage } from '../components/EditableHomePage';
import type { LandingPageConfig } from '../types/landingConfig';

interface HomePageProps {
  onNavigate?: (view: string) => void;
  config?: LandingPageConfig;
}

export function HomePage({ onNavigate, config }: HomePageProps) {
  // If config is provided, use EditableHomePage
  if (config) {
    return (
      <div>
        <EditableHomePage config={config} />
        {/* Navigation overlay */}
        <div className="fixed top-4 right-4 z-50 flex gap-2 flex-wrap max-w-xl justify-end">
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('dynamic-form')} className="bg-white/90 backdrop-blur">
            <FileText className="mr-2 h-4 w-4" />
            Dynamic Form
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('builder')} className="bg-white/90 backdrop-blur">
            <Hammer className="mr-2 h-4 w-4" />
            Builder
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('drafts')} className="bg-white/90 backdrop-blur">
            <FolderOpen className="mr-2 h-4 w-4" />
            Drafts
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('neumorphism-gallery')} className="bg-white/90 backdrop-blur">
            <Palette className="mr-2 h-4 w-4" />
            Neumorphism
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('landing-customizer')} className="bg-white/90 backdrop-blur">
            <Settings className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </div>
      </div>
    );
  }

  // Original hardcoded version
  // Mock company logos - using icon placeholders
  const companies = [
    { name: 'Analytics', Icon: BarChart3 },
    { name: 'Assessment', Icon: ClipboardCheck },
    { name: 'Data', Icon: Database },
    { name: 'Scoring', Icon: Timer },
  ];

  const features = [
    {
      title: 'Streamlined Evaluation',
      description: 'Comprehensive technology assessment with automated scoring and recommendations.',
      icon: ClipboardCheck,
    },
    {
      title: 'Data-Driven Insights',
      description: 'Make informed decisions based on market analysis and competitive intelligence.',
      icon: BarChart3,
    },
    {
      title: 'Efficient Workflow',
      description: 'Save time with our intuitive form builder and automated calculations.',
      icon: Timer,
    },
    {
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security for your confidential innovation data.',
      icon: Database,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-500 font-bold text-xl">✚</div>
              <span className="font-semibold text-lg">CCHMC</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="default" size="sm" onClick={() => onNavigate?.('home')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('dynamic-form')}>
                <FileText className="mr-2 h-4 w-4" />
                Dynamic Form
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('builder')}>
                <Hammer className="mr-2 h-4 w-4" />
                Builder
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('drafts')}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Drafts
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('landing-customizer')}>
                <Settings className="mr-2 h-4 w-4" />
                Customize
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <DotPattern
          className="absolute inset-0 opacity-20"
          cx={1}
          cy={1}
          cr={1}
        />

        <div className="container relative mx-auto px-4 py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-300 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Introducing CCHMC Technology Triage Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              we put the <span className="text-red-500">no</span> in tech<span className="text-red-500">no</span>logy
            </h1>

            {/* Text Effects Link */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-300 -mt-4"
              onClick={() => onNavigate?.('text-effects')}
            >
              <Palette className="w-4 h-4 mr-2" />
              Try different text effects
            </Button>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 max-w-2xl">
              Evaluate innovations efficiently with our comprehensive platform built for Cincinnati Children's Hospital Medical Center
            </p>

            {/* CTA Button */}
            <ShimmerButton
              className="text-lg px-8 py-4"
              background="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              onClick={() => onNavigate?.('dynamic-form')}
            >
              <span className="flex items-center gap-2">
                Start Evaluation
                <ArrowRight className="w-5 h-5" />
              </span>
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wide">
            Powered by Advanced Analytics
          </p>
          <Marquee className="[--duration:20s]" pauseOnHover>
            {companies.map((company, idx) => (
              <Card key={idx} className="bg-gray-900/50 border-gray-800 w-48">
                <CardContent className="flex items-center justify-center p-6">
                  <company.Icon className="w-8 h-8 text-gray-400" />
                  <span className="ml-3 text-gray-300">{company.name}</span>
                </CardContent>
              </Card>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-xl text-gray-400">
              Comprehensive tools for technology triage and evaluation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-blue-500/10">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <DotPattern
          className="absolute inset-0 opacity-10"
          cx={1}
          cy={1}
          cr={1}
        />

        <div className="container relative mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to streamline your innovation process?
            </h2>
            <p className="text-xl text-gray-400">
              Start evaluating technologies with confidence today
            </p>
            <ShimmerButton
              className="text-lg px-8 py-4"
              background="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              onClick={() => onNavigate?.('dynamic-form')}
            >
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </span>
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="text-blue-500 font-bold text-xl">✚</div>
              <span className="font-semibold">CCHMC Technology Triage Platform</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Cincinnati Children's Hospital Medical Center. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
