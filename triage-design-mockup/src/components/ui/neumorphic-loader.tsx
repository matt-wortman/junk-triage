import { getNeumorphicShadow, getNeumorphicColors, type NeumorphicTheme } from '@/lib/neumorphism';

interface NeumorphicSpinnerProps {
  theme?: NeumorphicTheme;
  size?: 'sm' | 'md' | 'lg';
}

const spinnerSizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function NeumorphicSpinner({ theme = 'light', size = 'md' }: NeumorphicSpinnerProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'raised');

  return (
    <div
      className={`
        ${spinnerSizes[size]}
        rounded-full
        relative
        animate-spin
      `}
      style={{
        backgroundColor: colors.background,
        boxShadow: shadow,
      }}
    >
      <div
        className="absolute top-0 left-1/2 w-1 h-3 rounded-full -translate-x-1/2"
        style={{ backgroundColor: '#60a5fa' }}
      />
    </div>
  );
}

export function NeumorphicPulse({ theme = 'light', size = 'md' }: NeumorphicSpinnerProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'raised');

  return (
    <div
      className={`
        ${spinnerSizes[size]}
        rounded-full
        animate-pulse
      `}
      style={{
        backgroundColor: colors.background,
        boxShadow: shadow,
      }}
    />
  );
}

interface NeumorphicDotsProps {
  theme?: NeumorphicTheme;
}

export function NeumorphicDots({ theme = 'light' }: NeumorphicDotsProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'raised');

  return (
    <div className="flex gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full animate-bounce"
          style={{
            backgroundColor: colors.background,
            boxShadow: shadow,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

interface NeumorphicProgressProps {
  value: number; // 0-100
  theme?: NeumorphicTheme;
  className?: string;
}

export function NeumorphicProgress({
  value,
  theme = 'light',
  className = '',
}: NeumorphicProgressProps) {
  const colors = getNeumorphicColors(theme);
  const trackShadow = getNeumorphicShadow(theme, 'inset');
  const barShadow = getNeumorphicShadow(theme, 'raised');

  return (
    <div
      className={`w-full h-3 rounded-full relative overflow-hidden ${className}`}
      style={{
        backgroundColor: colors.background,
        boxShadow: trackShadow,
      }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          backgroundColor: '#60a5fa',
          boxShadow: barShadow,
        }}
      />
    </div>
  );
}
