import { useState } from 'react';
import { Section } from './components/Section';
import { Navigation } from './components/Navigation';
import { Gallery } from './components/Gallery';
import { VortexTest } from './VortexTest';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { FileText, Hammer, Home, Palette } from 'lucide-react';
import { mockFormTemplate } from './data/mockFormData';
import { themes, defaultTheme, type Theme } from './themes';
import { Vortex } from './components/ui/vortex';

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [view, setView] = useState<'form' | 'gallery' | 'vortex-test'>('form');
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  const { name, description, version, sections } = mockFormTemplate;
  const totalSections = sections.length;
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  const handleNext = () => {
    if (!isLastSection) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleExport = () => {
    console.log('Export PDF clicked');
  };

  const handleSaveDraft = () => {
    console.log('Save draft clicked');
  };

  const handleSubmit = () => {
    console.log('Submit form clicked');
  };

  const currentSectionData = sections[currentSection];

  // Special case for vortex test
  if (view === 'vortex-test') {
    return <VortexTest />;
  }

  const content = (
    <div className={`min-h-screen ${currentTheme.background?.type === 'vortex' ? 'bg-transparent' : 'bg-gray-50'}`}>
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-primary font-bold text-xl">✚</div>
              <span className="font-semibold text-lg">Technology Triage (Mockup)</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <select
                value={currentTheme.id}
                onChange={(e) => setCurrentTheme(themes[e.target.value])}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {Object.values(themes).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>

              <Button
                variant={view === 'vortex-test' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('vortex-test')}
              >
                Vortex Test
              </Button>
              <Button
                variant={view === 'gallery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('gallery')}
              >
                <Palette className="mr-2 h-4 w-4" />
                Gallery
              </Button>
              <Button
                variant={view === 'form' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('form')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Form
              </Button>
              <Button variant="ghost" size="sm">
                <Hammer className="mr-2 h-4 w-4" />
                Builder
              </Button>
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {view === 'form' ? (
          <>
            {/* Form Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <p className="text-gray-600">{description}</p>
                  <p className="text-sm text-gray-500">Version: {version}</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="space-y-8">
              {/* Current Section */}
              <Section section={currentSectionData} theme={currentTheme} />

              {/* Navigation */}
              <Navigation
                currentSection={currentSection}
                totalSections={totalSections}
                isFirstSection={isFirstSection}
                isLastSection={isLastSection}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onExport={handleExport}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
              />
            </div>
          </>
        ) : (
          <Gallery />
        )}
      </div>
    </div>
  );

  // Wrap with Vortex if theme uses it
  if (currentTheme.background?.type === 'vortex') {
    return (
      <Vortex
        particleCount={currentTheme.background.particleCount}
        baseHue={currentTheme.background.baseHue}
        baseSpeed={currentTheme.background.baseSpeed}
        rangeSpeed={currentTheme.background.rangeSpeed}
        backgroundColor={currentTheme.background.backgroundColor}
        containerClassName="w-screen h-screen"
        className="w-full h-full"
      >
        {content}
      </Vortex>
    );
  }

  return content;
}

export default App;
