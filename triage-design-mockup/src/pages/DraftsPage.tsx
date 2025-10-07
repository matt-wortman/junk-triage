import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FileText, Calendar, User, Trash2, Edit } from 'lucide-react';

export function DraftsPage() {
  const drafts = [
    {
      id: 1,
      title: 'AI-Powered Diagnostic Tool',
      techId: '2024-001',
      reviewer: 'Dr. Sarah Johnson',
      lastModified: '2025-10-04',
      progress: 65,
      status: 'in-progress',
    },
    {
      id: 2,
      title: 'Portable Ultrasound Device',
      techId: '2024-002',
      reviewer: 'Dr. Michael Chen',
      lastModified: '2025-10-03',
      progress: 30,
      status: 'draft',
    },
    {
      id: 3,
      title: 'Remote Patient Monitoring System',
      techId: '2024-003',
      reviewer: 'Dr. Emily Rodriguez',
      lastModified: '2025-10-02',
      progress: 90,
      status: 'review',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-primary font-bold text-xl">✚</div>
              <span className="font-semibold text-lg">CCHMC - My Drafts</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Drafts</h1>
          <p className="text-gray-600">Continue working on your saved evaluations</p>
        </div>

        {/* Drafts List */}
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{draft.title}</h3>
                      <Badge
                        variant={
                          draft.status === 'in-progress'
                            ? 'default'
                            : draft.status === 'review'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {draft.status === 'in-progress'
                          ? 'In Progress'
                          : draft.status === 'review'
                          ? 'Ready for Review'
                          : 'Draft'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Tech ID: {draft.techId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{draft.reviewer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Last modified: {draft.lastModified}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{draft.progress}% complete</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${draft.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Continue
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (hidden when drafts exist) */}
        {drafts.length === 0 && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No drafts yet</h3>
              <p className="text-gray-600 mb-4">Start a new evaluation to create your first draft</p>
              <Button>Start New Evaluation</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
