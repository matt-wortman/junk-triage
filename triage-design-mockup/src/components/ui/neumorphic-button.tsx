import { useState } from 'react';
import { getNeumorphicShadow, getNeumorphicColors, neumorphicClasses, type NeumorphicTheme } from '@/lib/neumorphism';
import type { LucideIcon } from 'lucide-react';

interface NeumorphicButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  theme?: NeumorphicTheme;
  variant?: 'raised' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function NeumorphicButton({
  children,
  onClick,
  theme = 'light',
  variant = 'raised',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
}: NeumorphicButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, isPressed ? 'inset' : variant);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled}
      className={`
        ${neumorphicClasses.base}
        ${neumorphicClasses.button}
        ${sizeClasses[size]}
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: disabled ? 'none' : shadow,
      }}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </button>
  );
}

// Toggle Button Variant
interface NeumorphicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  theme?: NeumorphicTheme;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const toggleSizes = {
  sm: { width: 'w-12', height: 'h-6', circle: 'w-4 h-4' },
  md: { width: 'w-14', height: 'h-7', circle: 'w-5 h-5' },
  lg: { width: 'w-16', height: 'h-8', circle: 'w-6 h-6' },
};

export function NeumorphicToggle({
  checked,
  onChange,
  theme = 'light',
  size = 'md',
  label,
}: NeumorphicToggleProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'inset');
  const circleShadow = getNeumorphicShadow(theme, 'raised');
  const sizes = toggleSizes[size];

  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        ${sizes.width} ${sizes.height}
        ${neumorphicClasses.base}
        rounded-full
        flex items-center
        px-1
        relative
      `}
      style={{
        backgroundColor: colors.background,
        boxShadow: shadow,
      }}
      aria-label={label}
    >
      <div
        className={`
          ${sizes.circle}
          rounded-full
          transition-transform duration-300
          ${checked ? 'translate-x-full' : 'translate-x-0'}
        `}
        style={{
          backgroundColor: checked ? '#60a5fa' : colors.background,
          boxShadow: circleShadow,
        }}
      />
    </button>
  );
}

// Icon Button Variant
interface NeumorphicIconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  theme?: NeumorphicTheme;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

const iconButtonSizes = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function NeumorphicIconButton({
  icon: Icon,
  onClick,
  theme = 'light',
  size = 'md',
  ariaLabel,
}: NeumorphicIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, isPressed ? 'inset' : 'raised');

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={ariaLabel}
      className={`
        ${neumorphicClasses.base}
        ${iconButtonSizes[size]}
        rounded-full
        flex items-center justify-center
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: shadow,
      }}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
