"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, FileText, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getUserDrafts, deleteDraftResponse } from '../actions';
import { toast } from 'sonner';

interface DraftSummary {
  id: string;
  templateName: string;
  templateVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

function DraftsContent() {
  const searchParams = useSearchParams();
  const justSubmitted = searchParams?.get('submitted') === 'true';

  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDraft, setDeletingDraft] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(justSubmitted);

  useEffect(() => {
    loadDrafts();

    // Show success message if redirected from successful submission
    if (justSubmitted) {
      toast.success('Form submitted successfully!');
      // Hide banner after 5 seconds
      setTimeout(() => setShowSuccessBanner(false), 5000);
    }
  }, [justSubmitted]);

  const loadDrafts = async () => {
    try {
      const result = await getUserDrafts();
      if (result.success && result.drafts) {
        setDrafts(result.drafts.map(draft => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt),
        })));
      } else {
        toast.error(result.error || 'Failed to load drafts');
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast.error('An error occurred while loading drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    setDeletingDraft(draftId);
    try {
      const result = await deleteDraftResponse(draftId);
      if (result.success) {
        toast.success('Draft deleted successfully');
        // Remove the draft from the local state
        setDrafts(prev => prev.filter(draft => draft.id !== draftId));
      } else {
        toast.error(result.error || 'Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('An error occurred while deleting the draft');
    } finally {
      setDeletingDraft(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
              <p className="text-gray-600 mt-2">
                Continue working on your saved form drafts
              </p>
            </div>
            <Link href="/dynamic-form">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Start New Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Success Banner */}
        {showSuccessBanner && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Form submitted successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    Your technology triage form has been submitted and is now under review.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessBanner(false)}
                  className="ml-auto text-green-600 hover:text-green-700"
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No drafts found
              </h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t saved any form drafts yet. Start a new form to begin.
              </p>
              <Link href="/dynamic-form">
                <Button>Start New Form</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {draft.templateName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          v{draft.templateVersion}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {format(draft.createdAt, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Modified {format(draft.updatedAt, 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dynamic-form?draft=${draft.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Continue Editing
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                        disabled={deletingDraft === draft.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingDraft === draft.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading drafts...</p>
      </div>
    </div>
  );
}

export default function DraftsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DraftsContent />
    </Suspense>
  );
}