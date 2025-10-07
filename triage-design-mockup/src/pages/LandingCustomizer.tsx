import { useState } from 'react';
import { EditableHomePage } from '../components/EditableHomePage';
import { IconPicker } from '../components/IconPicker';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { defaultLandingConfig } from '../types/landingConfig';
import type { LandingPageConfig, TextEffect, TextSize } from '../types/landingConfig';
import { Copy, Plus, Trash2, Home } from 'lucide-react';

interface LandingCustomizerProps {
  onNavigate?: (view: string) => void;
  config: LandingPageConfig;
  onSave: (config: LandingPageConfig) => void;
}

const TEXT_SIZES: TextSize[] = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];

const TEXT_EFFECTS: { value: TextEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'shiny', label: 'Shiny' },
  { value: 'glow', label: 'Glow' },
  { value: 'neon', label: 'Neon' },
  { value: 'outline', label: 'Outline' },
  { value: '3d', label: '3D' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'gold', label: 'Gold' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'fire', label: 'Fire' },
  { value: 'ice', label: 'Ice' },
];

export function LandingCustomizer({ onNavigate, config: initialConfig, onSave }: LandingCustomizerProps) {
  const [config, setConfig] = useState<LandingPageConfig>(initialConfig);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [copiedToast, setCopiedToast] = useState(false);

  const updateConfig = (path: string[], value: any) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const addMarqueeItem = () => {
    const newItem = {
      id: Date.now().toString(),
      iconName: 'Star',
      text: 'New Item',
    };
    setConfig((prev) => ({
      ...prev,
      marquee: {
        ...prev.marquee,
        items: [...prev.marquee.items, newItem],
      },
    }));
  };

  const removeMarqueeItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      marquee: {
        ...prev.marquee,
        items: prev.marquee.items.filter((item) => item.id !== id),
      },
    }));
  };

  const addFeatureCard = () => {
    const newCard = {
      id: Date.now().toString(),
      iconName: 'Star',
      title: 'New Feature',
      description: 'Feature description',
    };
    setConfig((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        cards: [...prev.features.cards, newCard],
      },
    }));
  };

  const removeFeatureCard = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        cards: prev.features.cards.filter((card) => card.id !== id),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('home')}>
                <Home className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">Landing Page Customizer</h1>
                <p className="text-sm text-gray-400">Edit and preview in real-time</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onSave(config)} variant="default">
                Save & Apply
              </Button>
              <Button onClick={copyConfigToClipboard} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                {copiedToast ? 'Copied!' : 'Copy JSON'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Split Screen Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Editor */}
        <div
          className="overflow-y-auto border-r border-gray-800 bg-gray-900 transition-all"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="p-6">
            <Accordion type="single" collapsible defaultValue="hero" className="w-full">
              {/* Hero Section */}
              <AccordionItem value="hero">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  Hero Section
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* Badge */}
                    <div className="space-y-2">
                      <Label className="text-white">Badge Text</Label>
                      <Input
                        value={config.hero.badge.text}
                        onChange={(e) => updateConfig(['hero', 'badge', 'text'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Badge Icon</Label>
                      <IconPicker
                        value={config.hero.badge.iconName}
                        onChange={(icon) => updateConfig(['hero', 'badge', 'iconName'], icon)}
                      />
                    </div>

                    {/* Heading Segments */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Heading Text Segments</Label>
                        <Button
                          onClick={() => {
                            const newSegments = [...config.hero.heading.segments, { text: 'new' }];
                            updateConfig(['hero', 'heading', 'segments'], newSegments);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Segment
                        </Button>
                      </div>
                      {config.hero.heading.segments.map((segment, index) => (
                        <div key={index} className="border border-gray-700 rounded-md p-4 space-y-3 bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Segment {index + 1}</span>
                            <Button
                              onClick={() => {
                                const newSegments = config.hero.heading.segments.filter((_, i) => i !== index);
                                updateConfig(['hero', 'heading', 'segments'], newSegments);
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Text</Label>
                            <Input
                              value={segment.text}
                              onChange={(e) => {
                                const newSegments = [...config.hero.heading.segments];
                                newSegments[index] = { ...segment, text: e.target.value };
                                updateConfig(['hero', 'heading', 'segments'], newSegments);
                              }}
                              className="bg-gray-800 text-white border-gray-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Color (Tailwind class)</Label>
                            <Input
                              value={segment.color || ''}
                              onChange={(e) => {
                                const newSegments = [...config.hero.heading.segments];
                                newSegments[index] = { ...segment, color: e.target.value || undefined };
                                updateConfig(['hero', 'heading', 'segments'], newSegments);
                              }}
                              placeholder="e.g., text-red-500"
                              className="bg-gray-800 text-white border-gray-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Text Effect</Label>
                            <Select
                              value={segment.effect || 'none'}
                              onValueChange={(value) => {
                                const newSegments = [...config.hero.heading.segments];
                                newSegments[index] = { ...segment, effect: value === 'none' ? undefined : value as TextEffect };
                                updateConfig(['hero', 'heading', 'segments'], newSegments);
                              }}
                            >
                              <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TEXT_EFFECTS.map((effect) => (
                                  <SelectItem key={effect.value} value={effect.value}>
                                    {effect.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Heading Size (Mobile)</Label>
                      <Select
                        value={config.hero.heading.size}
                        onValueChange={(value) => updateConfig(['hero', 'heading', 'size'], value)}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEXT_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Heading Size (Desktop)</Label>
                      <Select
                        value={config.hero.heading.mdSize}
                        onValueChange={(value) => updateConfig(['hero', 'heading', 'mdSize'], value)}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEXT_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-2">
                      <Label className="text-white">Subtitle</Label>
                      <Textarea
                        value={config.hero.subtitle}
                        onChange={(e) => updateConfig(['hero', 'subtitle'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                        rows={3}
                      />
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-2">
                      <Label className="text-white">CTA Button Text</Label>
                      <Input
                        value={config.hero.ctaButton.text}
                        onChange={(e) => updateConfig(['hero', 'ctaButton', 'text'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">CTA Button Gradient</Label>
                      <Input
                        value={config.hero.ctaButton.gradient}
                        onChange={(e) => updateConfig(['hero', 'ctaButton', 'gradient'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                        placeholder="linear-gradient(...)"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Marquee Section */}
              <AccordionItem value="marquee">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  Marquee / Scrolling Items
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-white">Section Title</Label>
                      <Input
                        value={config.marquee.title}
                        onChange={(e) => updateConfig(['marquee', 'title'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Marquee Items</Label>
                        <Button onClick={addMarqueeItem} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {config.marquee.items.map((item, index) => (
                        <div key={item.id} className="border border-gray-700 rounded-md p-4 space-y-3 bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Item {index + 1}</span>
                            <Button
                              onClick={() => removeMarqueeItem(item.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Icon</Label>
                            <IconPicker
                              value={item.iconName}
                              onChange={(icon) => {
                                const newItems = [...config.marquee.items];
                                newItems[index] = { ...item, iconName: icon };
                                updateConfig(['marquee', 'items'], newItems);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Text</Label>
                            <Input
                              value={item.text}
                              onChange={(e) => {
                                const newItems = [...config.marquee.items];
                                newItems[index] = { ...item, text: e.target.value };
                                updateConfig(['marquee', 'items'], newItems);
                              }}
                              className="bg-gray-800 text-white border-gray-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Features Section */}
              <AccordionItem value="features">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  Features Grid
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-white">Section Heading</Label>
                      <Input
                        value={config.features.heading}
                        onChange={(e) => updateConfig(['features', 'heading'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Section Subtitle</Label>
                      <Input
                        value={config.features.subtitle}
                        onChange={(e) => updateConfig(['features', 'subtitle'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Feature Cards</Label>
                        <Button onClick={addFeatureCard} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Card
                        </Button>
                      </div>
                      {config.features.cards.map((card, index) => (
                        <div key={card.id} className="border border-gray-700 rounded-md p-4 space-y-3 bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Card {index + 1}</span>
                            <Button
                              onClick={() => removeFeatureCard(card.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Icon</Label>
                            <IconPicker
                              value={card.iconName}
                              onChange={(icon) => {
                                const newCards = [...config.features.cards];
                                newCards[index] = { ...card, iconName: icon };
                                updateConfig(['features', 'cards'], newCards);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Title</Label>
                            <Input
                              value={card.title}
                              onChange={(e) => {
                                const newCards = [...config.features.cards];
                                newCards[index] = { ...card, title: e.target.value };
                                updateConfig(['features', 'cards'], newCards);
                              }}
                              className="bg-gray-800 text-white border-gray-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Description</Label>
                            <Textarea
                              value={card.description}
                              onChange={(e) => {
                                const newCards = [...config.features.cards];
                                newCards[index] = { ...card, description: e.target.value };
                                updateConfig(['features', 'cards'], newCards);
                              }}
                              className="bg-gray-800 text-white border-gray-700"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Final CTA Section */}
              <AccordionItem value="finalCta">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  Final CTA Section
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-white">Heading</Label>
                      <Input
                        value={config.finalCTA.heading}
                        onChange={(e) => updateConfig(['finalCTA', 'heading'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Subtitle</Label>
                      <Input
                        value={config.finalCTA.subtitle}
                        onChange={(e) => updateConfig(['finalCTA', 'subtitle'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Button Text</Label>
                      <Input
                        value={config.finalCTA.buttonText}
                        onChange={(e) => updateConfig(['finalCTA', 'buttonText'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Button Gradient</Label>
                      <Input
                        value={config.finalCTA.buttonGradient}
                        onChange={(e) => updateConfig(['finalCTA', 'buttonGradient'], e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                        placeholder="linear-gradient(...)"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftWidth;

            const handleMouseMove = (e: MouseEvent) => {
              const delta = e.clientX - startX;
              const newWidth = startWidth + (delta / window.innerWidth) * 100;
              setLeftWidth(Math.min(Math.max(newWidth, 20), 80)); // Limit between 20% and 80%
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />

        {/* Right Panel - Live Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          <EditableHomePage config={config} />
        </div>
      </div>
    </div>
  );
}
