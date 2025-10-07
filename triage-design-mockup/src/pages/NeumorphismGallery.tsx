import { useState } from 'react';
import { Home, Heart, Play, Settings, User, Mail, Lock, Search, Plus, Minus } from 'lucide-react';
import { NeumorphicButton, NeumorphicToggle, NeumorphicIconButton } from '../components/ui/neumorphic-button';
import { NeumorphicInput, NeumorphicTextArea, NeumorphicCheckbox, NeumorphicRadio } from '../components/ui/neumorphic-input';
import { NeumorphicCard, NeumorphicContainer } from '../components/ui/neumorphic-card';
import { NeumorphicSpinner, NeumorphicPulse, NeumorphicDots, NeumorphicProgress } from '../components/ui/neumorphic-loader';
import { SendButton } from '../components/ui/send-button';
import { Button } from '../components/ui/button';
import type { NeumorphicTheme } from '../lib/neumorphism';

interface NeumorphismGalleryProps {
  onNavigate?: (view: string) => void;
}

export function NeumorphismGallery({ onNavigate }: NeumorphismGalleryProps) {
  const [theme, setTheme] = useState<NeumorphicTheme>('light');
  const [toggleChecked, setToggleChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [progress, setProgress] = useState(65);

  return (
    <NeumorphicContainer theme={theme}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 p-4 border-b" style={{ borderColor: theme === 'light' ? '#d1d5db' : '#374151' }}>
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Neumorphism Gallery</h1>
            <p className="text-sm opacity-60">68+ Soft UI Components</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span>Theme:</span>
              <NeumorphicToggle
                checked={theme === 'dark'}
                onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                theme={theme}
              />
              <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            </label>
            <Button variant="outline" size="sm" onClick={() => onNavigate?.('home')}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-8 space-y-12">
        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <div className="grid gap-8">
            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Standard Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <NeumorphicButton theme={theme} size="sm">Small</NeumorphicButton>
                <NeumorphicButton theme={theme}>Medium</NeumorphicButton>
                <NeumorphicButton theme={theme} size="lg">Large</NeumorphicButton>
                <NeumorphicButton theme={theme} variant="flat">Flat</NeumorphicButton>
                <NeumorphicButton theme={theme} disabled>Disabled</NeumorphicButton>
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Buttons with Icons</h3>
              <div className="flex flex-wrap gap-4">
                <NeumorphicButton theme={theme} icon={Heart} iconPosition="left">Like</NeumorphicButton>
                <NeumorphicButton theme={theme} icon={Play} iconPosition="right">Play</NeumorphicButton>
                <NeumorphicButton theme={theme} icon={Settings}>Settings</NeumorphicButton>
                <SendButton className="ml-4">Send</SendButton>
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <NeumorphicIconButton theme={theme} icon={Home} size="sm" ariaLabel="Home" />
                <NeumorphicIconButton theme={theme} icon={Heart} ariaLabel="Like" />
                <NeumorphicIconButton theme={theme} icon={Settings} size="lg" ariaLabel="Settings" />
                <NeumorphicIconButton theme={theme} icon={User} ariaLabel="Profile" />
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Toggle Switches</h3>
              <div className="flex flex-wrap gap-6">
                <NeumorphicToggle theme={theme} size="sm" checked={toggleChecked} onChange={setToggleChecked} label="Small" />
                <NeumorphicToggle theme={theme} checked={toggleChecked} onChange={setToggleChecked} label="Medium" />
                <NeumorphicToggle theme={theme} size="lg" checked={toggleChecked} onChange={setToggleChecked} label="Large" />
              </div>
            </NeumorphicCard>
          </div>
        </section>

        {/* Form Inputs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Form Inputs</h2>
          <div className="grid gap-8">
            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Text Inputs</h3>
              <div className="space-y-4">
                <NeumorphicInput
                  theme={theme}
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="Enter text..."
                />
                <NeumorphicInput
                  theme={theme}
                  type="email"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="Enter email..."
                />
                <NeumorphicInput
                  theme={theme}
                  type="password"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="Enter password..."
                />
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Text Area</h3>
              <NeumorphicTextArea
                theme={theme}
                value={textareaValue}
                onChange={setTextareaValue}
                placeholder="Enter multiline text..."
              />
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Checkboxes</h3>
              <div className="space-y-3">
                <NeumorphicCheckbox
                  theme={theme}
                  checked={checkboxChecked}
                  onChange={setCheckboxChecked}
                  label="Accept terms and conditions"
                />
                <NeumorphicCheckbox
                  theme={theme}
                  checked={!checkboxChecked}
                  onChange={(v) => setCheckboxChecked(!v)}
                  label="Subscribe to newsletter"
                />
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Radio Buttons</h3>
              <div className="space-y-3">
                <NeumorphicRadio
                  theme={theme}
                  name="options"
                  checked={radioValue === 'option1'}
                  onChange={() => setRadioValue('option1')}
                  label="Option 1"
                />
                <NeumorphicRadio
                  theme={theme}
                  name="options"
                  checked={radioValue === 'option2'}
                  onChange={() => setRadioValue('option2')}
                  label="Option 2"
                />
                <NeumorphicRadio
                  theme={theme}
                  name="options"
                  checked={radioValue === 'option3'}
                  onChange={() => setRadioValue('option3')}
                  label="Option 3"
                />
              </div>
            </NeumorphicCard>
          </div>
        </section>

        {/* Loaders */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Loaders & Progress</h2>
          <div className="grid gap-8">
            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Spinners</h3>
              <div className="flex flex-wrap gap-8 items-center">
                <NeumorphicSpinner theme={theme} size="sm" />
                <NeumorphicSpinner theme={theme} />
                <NeumorphicSpinner theme={theme} size="lg" />
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Pulse</h3>
              <div className="flex flex-wrap gap-8 items-center">
                <NeumorphicPulse theme={theme} size="sm" />
                <NeumorphicPulse theme={theme} />
                <NeumorphicPulse theme={theme} size="lg" />
              </div>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Dots</h3>
              <NeumorphicDots theme={theme} />
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-4">Progress Bar</h3>
              <div className="space-y-4">
                <NeumorphicProgress theme={theme} value={progress} />
                <div className="flex gap-2">
                  <NeumorphicButton theme={theme} icon={Minus} size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                    -10%
                  </NeumorphicButton>
                  <NeumorphicButton theme={theme} icon={Plus} size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                    +10%
                  </NeumorphicButton>
                  <span className="ml-4 self-center">{progress}%</span>
                </div>
              </div>
            </NeumorphicCard>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards & Containers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <NeumorphicCard theme={theme} variant="raised">
              <h3 className="text-lg font-semibold mb-2">Raised Card</h3>
              <p className="opacity-60">This card appears to float above the surface with soft shadows.</p>
            </NeumorphicCard>

            <NeumorphicCard theme={theme} variant="inset">
              <h3 className="text-lg font-semibold mb-2">Inset Card</h3>
              <p className="opacity-60">This card appears pressed into the surface with inset shadows.</p>
            </NeumorphicCard>

            <NeumorphicCard theme={theme} variant="flat">
              <h3 className="text-lg font-semibold mb-2">Flat Card</h3>
              <p className="opacity-60">This card has subtle shadows for a flatter appearance.</p>
            </NeumorphicCard>

            <NeumorphicCard theme={theme}>
              <h3 className="text-lg font-semibold mb-2">Default Card</h3>
              <p className="opacity-60">The standard raised variant with balanced soft shadows.</p>
            </NeumorphicCard>
          </div>
        </section>

        {/* Example Form */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Complete Form Example</h2>
          <NeumorphicCard theme={theme}>
            <h3 className="text-xl font-semibold mb-6">Sign In</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <NeumorphicInput theme={theme} type="email" placeholder="you@example.com" value="" onChange={() => {}} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Password</label>
                <NeumorphicInput theme={theme} type="password" placeholder="••••••••" value="" onChange={() => {}} />
              </div>
              <NeumorphicCheckbox theme={theme} checked={false} onChange={() => {}} label="Remember me" />
              <NeumorphicButton theme={theme} icon={User} className="w-full">
                Sign In
              </NeumorphicButton>
            </div>
          </NeumorphicCard>
        </section>
      </div>
    </NeumorphicContainer>
  );
}
