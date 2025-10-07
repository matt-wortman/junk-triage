/**
 * Neumorphism Design System Utilities
 * Soft UI / Neumorphic design helpers for consistent styling
 */

export const neumorphicThemes = {
  light: {
    background: '#e0e5ec',
    shadowLight: 'rgba(255, 255, 255, 0.6)',
    shadowDark: '#a3b1c6',
    text: '#353535',
    textMuted: '#6b7280',
  },
  dark: {
    background: '#2d3748',
    shadowLight: 'rgba(255, 255, 255, 0.05)',
    shadowDark: '#1a202c',
    text: '#f7fafc',
    textMuted: '#a0aec0',
  },
} as const;

export type NeumorphicTheme = keyof typeof neumorphicThemes;

/**
 * Generate neumorphic box-shadow CSS
 */
export function getNeumorphicShadow(theme: NeumorphicTheme = 'light', type: 'raised' | 'inset' | 'flat' = 'raised') {
  const colors = neumorphicThemes[theme];

  const shadows = {
    raised: `9px 9px 16px 0px ${colors.shadowDark}, -9px -9px 16px 0px ${colors.shadowLight}`,
    inset: `inset 6px 6px 10px 0px ${colors.shadowDark}, inset -6px -6px 10px 0px ${colors.shadowLight}`,
    flat: `5px 5px 10px 0px ${colors.shadowDark}, -5px -5px 10px 0px ${colors.shadowLight}`,
  };

  return shadows[type];
}

/**
 * Get neumorphic theme colors
 */
export function getNeumorphicColors(theme: NeumorphicTheme = 'light') {
  return neumorphicThemes[theme];
}

/**
 * Tailwind class names for neumorphic components
 */
export const neumorphicClasses = {
  base: 'transition-all duration-200',
  button: 'rounded-2xl font-medium cursor-pointer active:scale-95',
  input: 'rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/50',
  card: 'rounded-3xl p-6',
} as const;
