import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Check,
  X,
  AlertCircle,
  Info,
  Star,
  Heart,
  Download,
  Upload,
  Save,
  Send
} from 'lucide-react';

export function Gallery() {
  return (
    <div className="space-y-12 py-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Component Gallery</h1>
        <p className="text-muted-foreground">
          Explore different design variations for form components
        </p>
      </div>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>

        <div className="space-y-6">
          {/* Default Buttons */}
          <div>
            <h3 className="text-lg font-medium mb-3">Default Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Buttons with Icons */}
          <div>
            <h3 className="text-lg font-medium mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Check className="mr-2 h-4 w-4" />
                Submit
              </Button>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div>
            <h3 className="text-lg font-medium mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Card Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card Styles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default Card */}
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Standard card with border and shadow
              </p>
            </CardContent>
          </Card>

          {/* Colored Header Card */}
          <Card className="border-0 shadow-md bg-blue-700 rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white">Blue Header Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100">
                Card with colored background
              </p>
            </CardContent>
          </Card>

          {/* Gradient Card */}
          <Card className="border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500">
              <CardTitle className="text-white">Gradient Card</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Card with gradient header
              </p>
            </CardContent>
          </Card>

          {/* Subtle Accent Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Accent Border Card</CardTitle>
            </CardHeader>
            <CardContent className="bg-green-50/30 pt-6">
              <p className="text-sm text-green-700">
                Card with left accent border
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Input Field Styles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input Fields</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Standard Input */}
          <div className="space-y-2">
            <Label htmlFor="input1">Standard Input</Label>
            <Input id="input1" placeholder="Enter text..." />
          </div>

          {/* Input with Help Text */}
          <div className="space-y-2">
            <Label htmlFor="input2">With Help Text</Label>
            <p className="text-sm text-muted-foreground">This is helper text</p>
            <Input id="input2" placeholder="Enter text..." />
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <Label htmlFor="textarea1">Textarea</Label>
            <Textarea id="textarea1" placeholder="Enter longer text..." rows={3} />
          </div>

          {/* Input in Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="input3">Input in Card</Label>
                <Input id="input3" placeholder="Contained in card..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badge Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>

        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
          <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
        </div>
      </section>

      {/* Question Card Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Question Card Styles</h2>

        <div className="space-y-4">
          {/* Style 1: Default White */}
          <div className="space-y-2">
            <Badge variant="outline">Style 1: Classic Border</Badge>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="q1">
                      Technology ID
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Enter the technology identifier</p>
                  </div>
                  <Input id="q1" placeholder="e.g., 1111-2222" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Style 2: Subtle Background */}
          <div className="space-y-2">
            <Badge variant="outline">Style 2: Soft Gray</Badge>
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="q2">
                      Technology ID
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Enter the technology identifier</p>
                  </div>
                  <Input id="q2" placeholder="e.g., 1111-2222" className="bg-white" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Style 3: Colored Border */}
          <div className="space-y-2">
            <Badge variant="outline">Style 3: Accent Stripe</Badge>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="q3" className="text-blue-900">
                      Technology ID
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <p className="text-sm text-blue-700/70">Enter the technology identifier</p>
                  </div>
                  <Input id="q3" placeholder="e.g., 1111-2222" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Style 4: No Card Border */}
          <div className="space-y-2">
            <Badge variant="outline">Style 4: Clean Shadow</Badge>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="q4">
                      Technology ID
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Enter the technology identifier</p>
                  </div>
                  <Input id="q4" placeholder="e.g., 1111-2222" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Color Palettes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palettes</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Blue Theme */}
          <Card className="border-0 bg-blue-700 text-white">
            <CardContent className="pt-6 text-center">
              <p className="font-semibold">Blue</p>
              <p className="text-sm opacity-80">Primary</p>
            </CardContent>
          </Card>

          {/* Gray Theme */}
          <Card className="border-0 bg-gray-700 text-white">
            <CardContent className="pt-6 text-center">
              <p className="font-semibold">Gray</p>
              <p className="text-sm opacity-80">Neutral</p>
            </CardContent>
          </Card>

          {/* Green Theme */}
          <Card className="border-0 bg-green-600 text-white">
            <CardContent className="pt-6 text-center">
              <p className="font-semibold">Green</p>
              <p className="text-sm opacity-80">Success</p>
            </CardContent>
          </Card>

          {/* Purple Theme */}
          <Card className="border-0 bg-purple-600 text-white">
            <CardContent className="pt-6 text-center">
              <p className="font-semibold">Purple</p>
              <p className="text-sm opacity-80">Accent</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
