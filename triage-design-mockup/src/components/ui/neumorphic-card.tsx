import { getNeumorphicShadow, getNeumorphicColors, neumorphicClasses, type NeumorphicTheme } from '@/lib/neumorphism';

interface NeumorphicCardProps {
  children: React.ReactNode;
  theme?: NeumorphicTheme;
  variant?: 'raised' | 'inset' | 'flat';
  className?: string;
}

export function NeumorphicCard({
  children,
  theme = 'light',
  variant = 'raised',
  className = '',
}: NeumorphicCardProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, variant);

  return (
    <div
      className={`
        ${neumorphicClasses.base}
        ${neumorphicClasses.card}
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: shadow,
      }}
    >
      {children}
    </div>
  );
}

interface NeumorphicContainerProps {
  children: React.ReactNode;
  theme?: NeumorphicTheme;
  className?: string;
}

export function NeumorphicContainer({
  children,
  theme = 'light',
  className = '',
}: NeumorphicContainerProps) {
  const colors = getNeumorphicColors(theme);

  return (
    <div
      className={`min-h-screen ${className}`}
      style={{
        backgroundColor: colors.background,
      }}
    >
      {children}
    </div>
  );
}
