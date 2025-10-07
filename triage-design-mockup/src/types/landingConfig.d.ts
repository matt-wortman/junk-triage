export type TextEffect =
  | 'none'
  | 'gradient'
  | 'aurora'
  | 'shiny'
  | 'glow'
  | 'neon'
  | 'outline'
  | '3d'
  | 'chrome'
  | 'gold'
  | 'rainbow'
  | 'fire'
  | 'ice';

export type TextSize =
  | 'text-xl'
  | 'text-2xl'
  | 'text-3xl'
  | 'text-4xl'
  | 'text-5xl'
  | 'text-6xl'
  | 'text-7xl'
  | 'text-8xl'
  | 'text-9xl';

export interface HeroConfig {
  badge: {
    text: string;
    iconName: string;
  };
  heading: {
    beforeNo: string;
    afterNo: string;
    size: TextSize;
    mdSize: TextSize;
    effect: TextEffect;
    noColor: string;
  };
  subtitle: string;
  ctaButton: {
    text: string;
    gradient: string;
  };
}

export interface MarqueeItem {
  id: string;
  iconName: string;
  text: string;
}

export interface MarqueeConfig {
  title: string;
  items: MarqueeItem[];
}

export interface FeatureCard {
  id: string;
  iconName: string;
  title: string;
  description: string;
}

export interface FeaturesConfig {
  heading: string;
  subtitle: string;
  cards: FeatureCard[];
}

export interface FinalCTAConfig {
  heading: string;
  subtitle: string;
  buttonText: string;
  buttonGradient: string;
}

export interface LandingPageConfig {
  hero: HeroConfig;
  marquee: MarqueeConfig;
  features: FeaturesConfig;
  finalCTA: FinalCTAConfig;
}

export declare const defaultLandingConfig: LandingPageConfig;
