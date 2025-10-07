import { useState } from 'react';
import { Section } from './components/Section';
import { Navigation } from './components/Navigation';
import { Gallery } from './components/Gallery';
import { VortexTest } from './VortexTest';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { DraftsPage } from './pages/DraftsPage';
import { TextEffectsGallery } from './pages/TextEffectsGallery';
import { LandingCustomizer } from './pages/LandingCustomizer';
import { SendButtonDemo } from './pages/SendButtonDemo';
import { NeumorphismGallery } from './pages/NeumorphismGallery';
import { defaultLandingConfig } from './types/landingConfig';
import type { LandingPageConfig } from './types/landingConfig';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent } from './components/ui/card';
import { FileText, Hammer, Home, Palette, LayoutDashboard, FolderOpen } from 'lucide-react';
import { mockFormTemplate } from './data/mockFormData';
import { themes, defaultTheme, type Theme } from './themes';
import { Vortex } from './components/ui/vortex';

type ViewType = 'home' | 'dynamic-form' | 'builder' | 'drafts' | 'gallery' | 'vortex-test' | 'text-effects' | 'landing-customizer' | 'send-button-demo' | 'neumorphism-gallery';

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [view, setView] = useState<ViewType>('home');
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  // Load landing config from localStorage on mount, fallback to default
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(() => {
    const saved = localStorage.getItem('landingConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved landing config:', e);
        return defaultLandingConfig;
      }
    }
    return defaultLandingConfig;
  });

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

  // Page routing
  if (view === 'home') {
    return <HomePage onNavigate={(newView) => setView(newView as ViewType)} config={landingConfig} />;
  }

  if (view === 'builder') {
    return <BuilderPage />;
  }

  if (view === 'drafts') {
    return <DraftsPage />;
  }

  if (view === 'gallery') {
    return <Gallery />;
  }

  if (view === 'vortex-test') {
    return <VortexTest />;
  }

  if (view === 'text-effects') {
    return <TextEffectsGallery onNavigate={(newView) => setView(newView as ViewType)} />;
  }

  if (view === 'send-button-demo') {
    return <SendButtonDemo onNavigate={(newView) => setView(newView as ViewType)} />;
  }

  if (view === 'neumorphism-gallery') {
    return <NeumorphismGallery onNavigate={(newView) => setView(newView as ViewType)} />;
  }

  if (view === 'landing-customizer') {
    return (
      <LandingCustomizer
        onNavigate={(newView) => setView(newView as ViewType)}
        config={landingConfig}
        onSave={(newConfig) => {
          setLandingConfig(newConfig);
          localStorage.setItem('landingConfig', JSON.stringify(newConfig));
          setView('home');
        }}
      />
    );
  }

  // Dynamic Form view with themes (default when view === 'dynamic-form')

  const isNeumorphism = currentTheme.id === 'neumorphism';
  const pageBackground = currentTheme.background?.type === 'vortex'
    ? 'bg-transparent'
    : currentTheme.pageBackground || 'bg-gray-400';

  const content = (
    <div className={`min-h-screen ${pageBackground}`}>
      {/* Navigation Bar */}
      <nav className={isNeumorphism
        ? `${currentTheme.navbar?.background} ${currentTheme.navbar?.border} ${currentTheme.navbar?.shadow}`
        : 'border-b bg-white'}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`font-bold text-xl ${isNeumorphism ? 'text-[#353535]' : 'text-primary'}`}>✚</div>
              <span className={`font-semibold text-lg ${isNeumorphism ? 'text-[#353535]' : ''}`}>Technology Triage (Mockup)</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <select
                value={currentTheme.id}
                onChange={(e) => setCurrentTheme(themes[e.target.value])}
                className={isNeumorphism && currentTheme.select
                  ? `h-9 px-3 py-1 text-sm ${currentTheme.select.className}`
                  : 'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'}
              >
                {Object.values(themes).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>

              {isNeumorphism ? (
                <>
                  <button onClick={() => setView('home')} className={`px-3 py-1.5 text-sm font-medium flex items-center ${currentTheme.button?.outlineClass}`}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </button>
                  <button onClick={() => setView('dynamic-form')} className={`px-3 py-1.5 text-sm font-medium flex items-center ${view === 'dynamic-form' ? currentTheme.button?.primaryClass : currentTheme.button?.outlineClass}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Dynamic Form
                  </button>
                  <button onClick={() => setView('builder')} className={`px-3 py-1.5 text-sm font-medium flex items-center ${currentTheme.button?.outlineClass}`}>
                    <Hammer className="mr-2 h-4 w-4" />
                    Builder
                  </button>
                  <button onClick={() => setView('drafts')} className={`px-3 py-1.5 text-sm font-medium flex items-center ${currentTheme.button?.outlineClass}`}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Drafts
                  </button>
                  <button onClick={() => setView('gallery')} className={`px-3 py-1.5 text-sm font-medium flex items-center ${currentTheme.button?.outlineClass}`}>
                    <Palette className="mr-2 h-4 w-4" />
                    Gallery
                  </button>
                  <button onClick={() => setView('vortex-test')} className={`px-3 py-1.5 text-sm font-medium ${currentTheme.button?.outlineClass}`}>
                    Vortex
                  </button>
                </>
              ) : (
                <>
                  <Button variant={view === 'home' ? 'default' : 'outline'} size="sm" onClick={() => setView('home')}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                  <Button variant={view === 'dynamic-form' ? 'default' : 'outline'} size="sm" onClick={() => setView('dynamic-form')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Dynamic Form
                  </Button>
                  <Button variant={view === 'builder' ? 'default' : 'outline'} size="sm" onClick={() => setView('builder')}>
                    <Hammer className="mr-2 h-4 w-4" />
                    Builder
                  </Button>
                  <Button variant={view === 'drafts' ? 'default' : 'outline'} size="sm" onClick={() => setView('drafts')}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Drafts
                  </Button>
                  <Button variant={view === 'gallery' ? 'default' : 'outline'} size="sm" onClick={() => setView('gallery')}>
                    <Palette className="mr-2 h-4 w-4" />
                    Gallery
                  </Button>
                  <Button variant={view === 'vortex-test' ? 'default' : 'outline'} size="sm" onClick={() => setView('vortex-test')}>
                    Vortex
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {view === 'dynamic-form' ? (
          <>
            {/* Form Header */}
            <Card className={isNeumorphism ? 'bg-[#e0e5ec] shadow-none border-0 mb-8' : 'mb-8'}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-bold ${isNeumorphism ? 'text-[#353535]' : ''}`}>{name}</h1>
                    <p className={isNeumorphism ? 'text-[#6b7280]' : 'text-gray-600'}>{description}</p>
                    <p className={`text-sm ${isNeumorphism ? 'text-[#6b7280]' : 'text-gray-500'}`}>Version: {version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                theme={currentTheme}
              />
            </div>
          </>
        ) : null}
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
