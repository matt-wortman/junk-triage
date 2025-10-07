// Landing page configuration
export type TextEffect = 'none' | 'gradient' | 'aurora' | 'shiny' | 'glow' | 'neon' | 'outline' | '3d' | 'chrome' | 'gold' | 'rainbow' | 'fire' | 'ice';
export type TextSize = 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl';

export interface HeadingSegment {
  text: string;
  effect?: TextEffect;
}

export interface Feature {
  id: string;
  iconName: string;
  title: string;
  description: string;
}

export interface MarqueeItem {
  id: string;
  iconName: string;
  text: string;
}

export interface LandingPageConfig {
  hero: {
    badge: {
      text: string;
      iconName: string;
    };
    heading: {
      segments: HeadingSegment[];
      size: TextSize;
      mdSize: TextSize;
    };
    subtitle: string;
    ctaButton: {
      text: string;
      gradient: string;
    };
  };
  marquee: {
    title: string;
    items: MarqueeItem[];
  };
  features: {
    heading: string;
    subtitle: string;
    cards: Feature[];
  };
  finalCTA: {
    heading: string;
    subtitle: string;
    buttonText: string;
    buttonGradient: string;
  };
}

export const defaultLandingConfig: LandingPageConfig = {
  "hero": {
    "badge": {
      "text": "CCHMC Technology Triage Platform",
      "iconName": "Sparkles"
    },
    "heading": {
      "segments": [
        {
          "text": "Innovation Ventures Data Studio",
          "effect": "aurora"
        }
      ],
      "size": "text-5xl",
      "mdSize": "text-7xl"
    },
    "subtitle": "\"Either I will find a way or I will make one\" -Hannibal Barca ",
    "ctaButton": {
      "text": "Enter",
      "gradient": "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
    }
  },
  "marquee": {
    "title": "Today's Specials",
    "items": [
      {
        "id": "1759778262972",
        "iconName": "Star",
        "text": "TRIAGE"
      },
      {
        "id": "1759778276376",
        "iconName": "BarChart3",
        "text": "VIABILITY"
      },
      {
        "id": "1759778301013",
        "iconName": "TrendingUp",
        "text": "OPPORTUNITY"
      },
      {
        "id": "1759778340271",
        "iconName": "ClipboardCheck",
        "text": "REPORTS"
      }
    ]
  },
  "features": {
    "heading": "Everything you need*",
    "subtitle": "*false",
    "cards": [
      {
        "id": "1",
        "iconName": "ClipboardCheck",
        "title": "Streamlined Evaluation",
        "description": "Comprehensive technology assessment with automated scoring and recommendations."
      },
      {
        "id": "2",
        "iconName": "BarChart3",
        "title": "Data-Driven Insights",
        "description": "Make informed decisions based on market analysis and competitive intelligence."
      },
      {
        "id": "3",
        "iconName": "Timer",
        "title": "Efficient Workflow",
        "description": "Save time with our intuitive form builder and automated calculations."
      },
      {
        "id": "4",
        "iconName": "Database",
        "title": "Secure & Compliant",
        "description": "Enterprise-grade security for your confidential innovation data."
      }
    ]
  },
  "finalCTA": {
    "heading": "Last chance before things get real!",
    "subtitle": "Start evaluating technologies with confidence today",
    "buttonText": "OK, fine....",
    "buttonGradient": "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
  }
};
