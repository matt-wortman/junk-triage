import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Zap } from 'lucide-react';
import { TextAnimate } from '../components/ui/text-animate';
import { HyperText } from '../components/ui/hyper-text';
import { SparklesText } from '../components/ui/sparkles-text';
import { TypingAnimation } from '../components/ui/typing-animation';

interface TextEffectsGalleryProps {
  onNavigate?: (view: string) => void;
  onSelectEffect?: (effect: string) => void;
}

type AnimationType = 'typing' | 'scramble' | 'sparkles' | 'blurIn' | 'scaleUp' | null;

export function TextEffectsGallery({ onNavigate }: TextEffectsGalleryProps) {
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [activeAnimation, setActiveAnimation] = useState<AnimationType>(null);
  const effects = [
    {
      id: 'gradient',
      name: 'Gradient',
      description: 'Smooth color gradient effect',
      preview: (
        <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          technology
        </span>
      ),
    },
    {
      id: 'aurora',
      name: 'Aurora',
      description: 'Multi-color aurora gradient',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold bg-[length:200%_auto] bg-clip-text text-transparent animate-aurora"
          style={{
            backgroundImage: 'linear-gradient(135deg, #FF0080, #7928CA, #0070F3, #38bdf8, #FF0080)',
          }}
        >
          technology
        </span>
      ),
    },
    {
      id: 'shiny',
      name: 'Shiny',
      description: 'Light glare shimmer effect',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold animate-shiny-text bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent bg-clip-text text-transparent [background-size:100px_100%] bg-no-repeat [background-position:0_0] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]"
        >
          technology
        </span>
      ),
    },
    {
      id: 'glow',
      name: 'Glow',
      description: 'Soft glow and shadow',
      preview: (
        <span className="text-5xl md:text-7xl font-bold text-blue-400" style={{ textShadow: '0 0 20px rgba(96, 165, 250, 0.6), 0 0 40px rgba(96, 165, 250, 0.4)' }}>
          technology
        </span>
      ),
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'Bright neon glow effect',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold text-cyan-400"
          style={{
            textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee, 0 0 40px #06b6d4'
          }}
        >
          technology
        </span>
      ),
    },
    {
      id: 'outline',
      name: 'Outline',
      description: 'Transparent with stroke',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold text-transparent"
          style={{
            WebkitTextStroke: '2px #60a5fa'
          }}
        >
          technology
        </span>
      ),
    },
    {
      id: '3d',
      name: '3D',
      description: 'Layered 3D depth effect',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold text-blue-400"
          style={{
            textShadow: '3px 3px 0 #1e40af, 6px 6px 0 #1e3a8a, 9px 9px 0 #172554'
          }}
        >
          technology
        </span>
      ),
    },
    {
      id: 'chrome',
      name: 'Chrome',
      description: 'Metallic chrome effect',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent"
        >
          technology
        </span>
      ),
    },
    {
      id: 'gold',
      name: 'Gold',
      description: 'Metallic gold gradient',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent"
        >
          technology
        </span>
      ),
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      description: 'Full spectrum gradient',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent"
        >
          technology
        </span>
      ),
    },
    {
      id: 'fire',
      name: 'Fire',
      description: 'Hot fire gradient',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 bg-clip-text text-transparent"
        >
          technology
        </span>
      ),
    },
    {
      id: 'ice',
      name: 'Ice',
      description: 'Cool icy gradient',
      preview: (
        <span
          className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-600 bg-clip-text text-transparent"
        >
          technology
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('home')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">Text Effects Gallery</h1>
                <p className="text-sm text-gray-400">Choose an effect for your hero text</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {effects.map((effect) => (
            <Card
              key={effect.id}
              className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer group"
              onClick={() => onSelectEffect?.(effect.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{effect.name}</CardTitle>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                    Preview
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">{effect.description}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-black/50 rounded-lg p-8 flex items-center justify-center min-h-[200px] group-hover:bg-black/70 transition-colors">
                  {effect.preview}
                </div>
                <Button
                  className="w-full mt-4"
                  variant={selectedEffect === effect.id ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEffect(effect.id);
                  }}
                >
                  {selectedEffect === effect.id ? 'Selected' : 'Use This Effect'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Animation Toggles */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-800">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Animated Effects</h2>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-gray-400 mb-6">Toggle one animation at a time</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={activeAnimation === 'typing' ? 'default' : 'outline'}
              onClick={() => setActiveAnimation(activeAnimation === 'typing' ? null : 'typing')}
            >
              Typing
            </Button>
            <Button
              variant={activeAnimation === 'scramble' ? 'default' : 'outline'}
              onClick={() => setActiveAnimation(activeAnimation === 'scramble' ? null : 'scramble')}
            >
              Scramble
            </Button>
            <Button
              variant={activeAnimation === 'sparkles' ? 'default' : 'outline'}
              onClick={() => setActiveAnimation(activeAnimation === 'sparkles' ? null : 'sparkles')}
            >
              Sparkles
            </Button>
            <Button
              variant={activeAnimation === 'blurIn' ? 'default' : 'outline'}
              onClick={() => setActiveAnimation(activeAnimation === 'blurIn' ? null : 'blurIn')}
            >
              Blur In
            </Button>
            <Button
              variant={activeAnimation === 'scaleUp' ? 'default' : 'outline'}
              onClick={() => setActiveAnimation(activeAnimation === 'scaleUp' ? null : 'scaleUp')}
            >
              Scale Up
            </Button>
          </div>
        </div>
      </div>

      {/* Current Hero Preview */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            Preview: Current Hero Text with {effects.find(e => e.id === selectedEffect)?.name || 'No'} Effect
            {activeAnimation && ` + ${activeAnimation.charAt(0).toUpperCase() + activeAnimation.slice(1)} Animation`}
          </h2>
          <div className="bg-black/50 rounded-lg p-12">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
              we put the <span className="text-red-500">no</span> in {getEffectPreview(selectedEffect, activeAnimation)}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );

  function getEffectPreview(effectId: string, animation: AnimationType) {
    const redNo = <span className="text-red-500">no</span>;
    const effectClass = getEffectClass(effectId);

    // Wrap with animation if active
    if (animation === 'typing') {
      return (
        <TypingAnimation className={effectClass} loop>
          technology
        </TypingAnimation>
      );
    } else if (animation === 'scramble') {
      return (
        <HyperText className={effectClass} as="span">
          technology
        </HyperText>
      );
    } else if (animation === 'sparkles') {
      return (
        <SparklesText className={effectClass}>
          technology
        </SparklesText>
      );
    } else if (animation === 'blurIn') {
      return (
        <TextAnimate animation="blurIn" by="character" className={effectClass} as="span">
          technology
        </TextAnimate>
      );
    } else if (animation === 'scaleUp') {
      return (
        <TextAnimate animation="scaleUp" by="character" className={effectClass} as="span">
          technology
        </TextAnimate>
      );
    }

    // No animation, just apply the effect with red "no"
    return <span className={effectClass}>tech{redNo}logy</span>;
  }

  function getEffectClass(effectId: string): string {
    switch(effectId) {
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
  }
}
