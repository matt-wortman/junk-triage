// Theme configuration for the triage form
// Each theme defines the complete visual style of the form

export interface Theme {
  id: string;
  name: string;
  description: string;

  // Background effect
  background?: {
    type?: 'vortex' | 'grid' | 'waves' | 'aurora' | 'none';
    particleCount?: number;
    baseHue?: number;
    baseSpeed?: number;
    rangeSpeed?: number;
    backgroundColor?: string;
  };

  // Page background
  pageBackground?: string;

  // Navigation bar styling
  navbar?: {
    background: string;
    border: string;
    shadow: string;
  };

  // Button styling
  button?: {
    primaryClass: string;
    outlineClass: string;
    disabledClass?: string;
  };

  // Select/dropdown styling
  select?: {
    className: string;
  };

  // Progress bar styling
  progress?: {
    containerClass: string;
    barClass: string;
  };

  // Section styling
  section: {
    background: string;
    borderRadius: string;
    shadow: string;
    border: string;
    overflow: string;
  };

  // Section header styling
  sectionHeader: {
    background: string;
    titleSize: string;
    titleColor: string;
    descriptionSize: string;
    descriptionColor: string;
  };

  // Question card styling
  questionCard: {
    background: string;
    border: string;
    shadow: string;
    borderRadius: string;
  };

  // Question label styling
  questionLabel: {
    size: string;
    weight: string;
    color: string;
    asteriskMargin: string;
  };

  // Input field styling
  input: {
    textareaRows: number;
    textareaResize: string;
    className?: string;  // Optional className for inputs (border, shadow overrides)
  };
}

export const themes: Record<string, Theme> = {
  theme1: {
    id: 'theme1',
    name: 'Clean & Professional',
    description: 'Light gray with clean shadows',

    section: {
      background: 'bg-gray-100',
      borderRadius: 'rounded-xl',
      shadow: 'shadow-md',
      border: 'border-0',
      overflow: 'overflow-hidden',
    },

    sectionHeader: {
      background: '',
      titleSize: 'text-2xl',
      titleColor: 'text-gray-900',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-gray-600',
    },

    questionCard: {
      background: '',
      border: 'border-0',
      shadow: 'shadow-lg',
      borderRadius: '',
    },

    questionLabel: {
      size: 'text-base',
      weight: 'font-semibold',
      color: '',
      asteriskMargin: '',
    },

    input: {
      textareaRows: 6,
      textareaResize: 'resize-y',
    },
  },

  theme2: {
    id: 'theme2',
    name: 'Blue Accent',
    description: 'Branded blue with accent stripes - professional with personality',

    section: {
      background: 'bg-blue-50',
      borderRadius: 'rounded-xl',
      shadow: 'shadow-md',
      border: 'border-0',
      overflow: 'overflow-hidden',
    },

    sectionHeader: {
      background: 'bg-blue-100',
      titleSize: 'text-2xl',
      titleColor: 'text-blue-900',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-blue-700',
    },

    questionCard: {
      background: 'bg-white',
      border: 'border-l-4 border-l-blue-500',
      shadow: 'shadow-md',
      borderRadius: '',
    },

    questionLabel: {
      size: 'text-base',
      weight: 'font-semibold',
      color: 'text-blue-900',
      asteriskMargin: '',
    },

    input: {
      textareaRows: 6,
      textareaResize: 'resize-y',
    },
  },

  theme3: {
    id: 'theme3',
    name: 'Minimal & Clean',
    description: 'Minimal design with subtle borders - focused and distraction-free',

    section: {
      background: 'bg-white',
      borderRadius: 'rounded-lg',
      shadow: 'shadow-sm',
      border: 'border border-gray-200',
      overflow: '',
    },

    sectionHeader: {
      background: 'bg-gray-50',
      titleSize: 'text-xl',
      titleColor: 'text-gray-900',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-gray-600',
    },

    questionCard: {
      background: 'bg-white',
      border: 'border border-gray-200',
      shadow: '',
      borderRadius: 'rounded-md',
    },

    questionLabel: {
      size: 'text-sm',
      weight: 'font-medium',
      color: 'text-gray-700',
      asteriskMargin: '',
    },

    input: {
      textareaRows: 4,
      textareaResize: 'resize-y',
    },
  },

  theme4: {
    id: 'theme4',
    name: 'Dark Elegance',
    description: 'Dark header with light content - modern and sophisticated',

    section: {
      background: 'bg-slate-800',
      borderRadius: 'rounded-xl',
      shadow: 'shadow-xl',
      border: 'border-0',
      overflow: 'overflow-hidden',
    },

    sectionHeader: {
      background: '',
      titleSize: 'text-2xl',
      titleColor: 'text-white',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-slate-300',
    },

    questionCard: {
      background: 'bg-white',
      border: 'border-0',
      shadow: 'shadow-lg',
      borderRadius: 'rounded-lg',
    },

    questionLabel: {
      size: 'text-base',
      weight: 'font-semibold',
      color: 'text-gray-900',
      asteriskMargin: '',
    },

    input: {
      textareaRows: 6,
      textareaResize: 'resize-y',
    },
  },

  theme5: {
    id: 'theme5',
    name: 'Soft Gradient',
    description: 'Gentle gradient backgrounds - warm and inviting',

    section: {
      background: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderRadius: 'rounded-xl',
      shadow: 'shadow-md',
      border: 'border-0',
      overflow: 'overflow-hidden',
    },

    sectionHeader: {
      background: 'bg-gradient-to-r from-purple-100 to-pink-100',
      titleSize: 'text-2xl',
      titleColor: 'text-purple-900',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-purple-700',
    },

    questionCard: {
      background: 'bg-white',
      border: 'border-0',
      shadow: 'shadow-md',
      borderRadius: 'rounded-lg',
    },

    questionLabel: {
      size: 'text-base',
      weight: 'font-semibold',
      color: 'text-purple-900',
      asteriskMargin: '',
    },

    input: {
      textareaRows: 6,
      textareaResize: 'resize-y',
    },
  },

  neumorphism: {
    id: 'neumorphism',
    name: 'Neumorphism',
    description: 'Soft UI design with subtle 3D effects - modern and tactile',

    background: {
      type: 'none',
      backgroundColor: '#e0e5ec',
    },

    pageBackground: 'bg-[#e0e5ec]',

    navbar: {
      background: 'bg-[#e0e5ec]',
      border: 'border-0',
      shadow: 'shadow-none',
    },

    button: {
      primaryClass: 'bg-[#e0e5ec] [box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)] hover:[box-shadow:3px_3px_6px_0px_#a3b1c6,_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] active:[box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] border-0 text-[#353535] rounded-xl transition-all',
      outlineClass: 'bg-[#e0e5ec] [box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)] hover:[box-shadow:3px_3px_6px_0px_#a3b1c6,_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] active:[box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] border-0 text-[#353535] rounded-xl transition-all',
      disabledClass: 'opacity-50 cursor-not-allowed',
    },

    select: {
      className: 'bg-[#e0e5ec] [box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)] border-0 text-[#353535] rounded-xl focus:outline-none focus:ring-0',
    },

    progress: {
      containerClass: 'bg-[#e0e5ec] [box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] rounded-full h-2',
      barClass: 'bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full [box-shadow:2px_2px_4px_0px_rgba(59,130,246,0.5)]',
    },

    section: {
      background: 'bg-[#e0e5ec]',
      borderRadius: 'rounded-3xl',
      shadow: 'shadow-none',
      border: 'border-0',
      overflow: '',
    },

    sectionHeader: {
      background: '',
      titleSize: 'text-2xl',
      titleColor: 'text-[#353535]',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-[#6b7280]',
    },

    questionCard: {
      background: 'bg-white',
      border: 'border-0',
      shadow: '[box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)]',
      borderRadius: 'rounded-2xl',
    },

    questionLabel: {
      size: 'text-base',
      weight: 'font-medium',
      color: 'text-[#353535]',
      asteriskMargin: '',
    },

    input: {
      textareaRows: 6,
      textareaResize: 'resize-y',
      className: 'border-0 shadow-none bg-[#f0f4f8] [box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#6b7280] text-[#353535]',
    },
  },
};

// Helper function to get theme classes as a string
export function getThemeClasses(theme: Theme, element: keyof Theme): string {
  const elementStyles = theme[element];
  if (typeof elementStyles === 'object' && elementStyles !== null) {
    return Object.values(elementStyles).filter(Boolean).join(' ');
  }
  return '';
}

// Default theme
export const defaultTheme = themes.theme1;

// Enable HMR for theme changes
if (import.meta.hot) {
  import.meta.hot.accept();
}
