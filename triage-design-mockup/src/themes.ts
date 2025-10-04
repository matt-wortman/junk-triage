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
  };
}

export const themes: Record<string, Theme> = {
  theme1: {
    id: 'theme1',
    name: 'Clean & Professional',
    description: 'Light gray with clean shadows and subtle vortex background',

    background: {
      type: 'vortex',
      particleCount: 700,
      baseHue: 120, // bright green
      baseSpeed: 0.5,
      rangeSpeed: 2.0,
      backgroundColor: '#000000', // black to see particles clearly
    },

    section: {
      background: 'bg-white/90',
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
