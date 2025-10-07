import { SendButton } from '../components/ui/send-button';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

interface SendButtonDemoProps {
  onNavigate?: (view: string) => void;
}

export function SendButtonDemo({ onNavigate }: SendButtonDemoProps) {
  return (
    <div className="min-h-screen bg-[#e0e5ec] flex flex-col">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => onNavigate?.('home')} className="bg-white/90 backdrop-blur">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Demo Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Send Button Demo</h1>
            <p className="text-gray-600">Click the button to see the animation</p>
          </div>

          <SendButton onClick={() => console.log('Message sent!')} />

          <div className="mt-12 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Features:</h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li>✨ Neumorphism design with soft shadows</li>
              <li>🚀 Flying send icon animation</li>
              <li>⚡ Built with Framer Motion (already in your project)</li>
              <li>🎨 Pure Tailwind CSS styling</li>
              <li>♿ Accessible and keyboard-friendly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
