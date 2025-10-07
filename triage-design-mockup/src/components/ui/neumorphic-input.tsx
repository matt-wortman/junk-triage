import { getNeumorphicShadow, getNeumorphicColors, neumorphicClasses, type NeumorphicTheme } from '@/lib/neumorphism';

interface NeumorphicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: NeumorphicTheme;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  className?: string;
}

export function NeumorphicInput({
  value,
  onChange,
  placeholder,
  theme = 'light',
  type = 'text',
  disabled = false,
  className = '',
}: NeumorphicInputProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'inset');

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        ${neumorphicClasses.base}
        ${neumorphicClasses.input}
        px-4 py-3
        w-full
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: shadow,
      }}
    />
  );
}

interface NeumorphicTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: NeumorphicTheme;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export function NeumorphicTextArea({
  value,
  onChange,
  placeholder,
  theme = 'light',
  rows = 4,
  disabled = false,
  className = '',
}: NeumorphicTextAreaProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'inset');

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`
        ${neumorphicClasses.base}
        ${neumorphicClasses.input}
        px-4 py-3
        w-full
        resize-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: shadow,
      }}
    />
  );
}

interface NeumorphicCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  theme?: NeumorphicTheme;
}

export function NeumorphicCheckbox({
  checked,
  onChange,
  label,
  theme = 'light',
}: NeumorphicCheckboxProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, checked ? 'inset' : 'raised');

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`
          w-6 h-6
          rounded-lg
          ${neumorphicClasses.base}
          flex items-center justify-center
        `}
        style={{
          backgroundColor: colors.background,
          boxShadow: shadow,
        }}
      >
        {checked && (
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{ color: '#60a5fa' }}
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {label && <span style={{ color: colors.text }}>{label}</span>}
    </label>
  );
}

interface NeumorphicRadioProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  theme?: NeumorphicTheme;
  name?: string;
}

export function NeumorphicRadio({
  checked,
  onChange,
  label,
  theme = 'light',
  name,
}: NeumorphicRadioProps) {
  const colors = getNeumorphicColors(theme);
  const shadow = getNeumorphicShadow(theme, 'inset');
  const dotShadow = getNeumorphicShadow(theme, 'raised');

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={onChange}
        className={`
          w-6 h-6
          rounded-full
          ${neumorphicClasses.base}
          flex items-center justify-center
        `}
        style={{
          backgroundColor: colors.background,
          boxShadow: shadow,
        }}
      >
        {checked && (
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: '#60a5fa',
              boxShadow: dotShadow,
            }}
          />
        )}
      </div>
      {label && <span style={{ color: colors.text }}>{label}</span>}
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}
