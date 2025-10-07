import * as Icons from 'lucide-react';
import { ShimmerButton } from './ui/shimmer-button';
import { Marquee } from './ui/marquee';
import { DotPattern } from './ui/dot-pattern';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { LandingPageConfig } from '../types/landingConfig';

interface EditableHomePageProps {
  config: LandingPageConfig;
}

export function EditableHomePage({ config }: EditableHomePageProps) {
  const { hero, marquee, features, finalCTA } = config;

  // Helper to get icon component from name
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as Icons.LucideIcon;
    return IconComponent || Icons.HelpCircle;
  };

  // Helper to get text effect class
  const getEffectClass = (effect: string): string => {
    switch (effect) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent';
      case 'aurora':
        return 'bg-[length:200%_auto] bg-clip-text text-transparent animate-aurora [background-image:linear-gradient(135deg,#FF0080,#7928CA,#0070F3,#38bdf8,#FF0080)]';
      case 'shiny':
        return 'animate-shiny-text bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent bg-clip-text text-transparent [background-size:100px_100%] bg-no-repeat [background-position:0_0]';
      case 'glow':
        return 'text-blue-400 [text-shadow:0_0_20px_rgba(96,165,250,0.6),0_0_40px_rgba(96,165,250,0.4)]';
      case 'neon':
        return 'text-cyan-400 [text-shadow:0_0_10px_#22d3ee,0_0_20px_#22d3ee,0_0_30px_#22d3ee,0_0_40px_#06b6d4]';
      case 'outline':
        return 'text-transparent [text-stroke:2px_#60a5fa] [-webkit-text-stroke:2px_#60a5fa]';
      case '3d':
        return 'text-blue-400 [text-shadow:3px_3px_0_#1e40af,6px_6px_0_#1e3a8a,9px_9px_0_#172554]';
      case 'chrome':
        return 'bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent';
      case 'gold':
        return 'bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent';
      case 'rainbow':
        return 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent';
      case 'fire':
        return 'bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 bg-clip-text text-transparent';
      case 'ice':
        return 'bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-600 bg-clip-text text-transparent';
      default:
        return '';
    }
  };

  const BadgeIcon = getIcon(hero.badge.iconName);
  const ArrowIcon = getIcon('ArrowRight');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
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
              <BadgeIcon className="w-4 h-4 mr-2" />
              {hero.badge.text}
            </Badge>

            {/* Main Heading */}
            <h1 className={`font-bold leading-tight ${hero.heading.size} ${hero.heading.mdSize.replace('text-', 'md:text-')}`}>
              {hero.heading.segments.map((segment, index) => {
                const className = segment.effect
                  ? getEffectClass(segment.effect)
                  : segment.color || 'text-white';
                return (
                  <span key={index} className={className}>
                    {segment.text}
                  </span>
                );
              })}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 max-w-2xl">
              {hero.subtitle}
            </p>

            {/* CTA Button */}
            <ShimmerButton
              className="text-lg px-8 py-4"
              background={hero.ctaButton.gradient}
            >
              <span className="flex items-center gap-2">
                {hero.ctaButton.text}
                <ArrowIcon className="w-5 h-5" />
              </span>
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wide">
            {marquee.title}
          </p>
          <Marquee className="[--duration:20s]" pauseOnHover>
            {marquee.items.map((item) => {
              const ItemIcon = getIcon(item.iconName);
              return (
                <Card key={item.id} className="bg-gray-900/50 border-gray-800 w-48">
                  <CardContent className="flex items-center justify-center p-6">
                    <ItemIcon className="w-8 h-8 text-gray-400" />
                    <span className="ml-3 text-gray-300">{item.text}</span>
                  </CardContent>
                </Card>
              );
            })}
          </Marquee>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{features.heading}</h2>
            <p className="text-xl text-gray-400">{features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {features.cards.map((card) => {
              const FeatureIcon = getIcon(card.iconName);
              return (
                <Card key={card.id} className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4 inline-flex p-3 rounded-lg bg-blue-500/10 self-start">
                      <FeatureIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 min-h-[56px]">{card.title}</h3>
                    <p className="text-gray-400 flex-grow">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
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
              {finalCTA.heading}
            </h2>
            <p className="text-xl text-gray-400">
              {finalCTA.subtitle}
            </p>
            <ShimmerButton
              className="text-lg px-8 py-4"
              background={finalCTA.buttonGradient}
            >
              <span className="flex items-center gap-2">
                {finalCTA.buttonText}
                <ArrowIcon className="w-5 h-5" />
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
