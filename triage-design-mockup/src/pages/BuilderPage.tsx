import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Settings, Eye } from 'lucide-react';

export function BuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-primary font-bold text-xl">✚</div>
              <span className="font-semibold text-lg">CCHMC - Form Builder</span>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Form Builder</h1>
          <p className="text-gray-600">Design and manage your triage form templates</p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Template Card 1 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>CCHMC Technology Triage Form</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Standard technology evaluation form with scoring matrix
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Version 2.0.0</span>
                <span>8 sections</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Card 2 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Quick Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Simplified form for rapid technology assessment
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Version 1.0.0</span>
                <span>4 sections</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* New Template Card */}
          <Card className="border-dashed hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Plus className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Create New Template</p>
              <p className="text-sm text-gray-500">Start from scratch or duplicate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
