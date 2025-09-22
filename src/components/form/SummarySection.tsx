import { FormData } from "@/app/form/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { calculateAllScores } from "@/lib/scoring";

interface SummarySectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function SummarySection({ data, updateData }: SummarySectionProps) {
  const scores = calculateAllScores(data);

  const addSME = () => {
    const newSME = {
      name: "",
      expertise: "",
      contactInfo: ""
    };
    updateData({
      subjectMatterExperts: [...(data.subjectMatterExperts || []), newSME]
    });
  };

  const updateSME = (index: number, field: string, value: string) => {
    const updatedSMEs = [...(data.subjectMatterExperts || [])];
    updatedSMEs[index] = { ...updatedSMEs[index], [field]: value };
    updateData({ subjectMatterExperts: updatedSMEs });
  };

  const removeSME = (index: number) => {
    const updatedSMEs = [...(data.subjectMatterExperts || [])];
    updatedSMEs.splice(index, 1);
    updateData({ subjectMatterExperts: updatedSMEs });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Proceed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Alternative Pathway":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Close":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Summary & Recommendation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Summary of results and recommendations based on the triage level assessment.
        </p>
      </div>

      {/* Quick Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{scores.impactScore.toFixed(2)}</div>
              <div className="text-sm text-blue-600">Impact Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{scores.valueScore.toFixed(2)}</div>
              <div className="text-sm text-green-600">Value Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{scores.marketScore.toFixed(2)}</div>
              <div className="text-sm text-purple-600">Market Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Badge className={`text-base px-3 py-1 ${getRecommendationColor(scores.recommendation)}`}>
                {scores.recommendation}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Recommendation</div>
            </div>
          </div>

          <div>
            <Label htmlFor="summaryText" className="text-base">
              Summary and Recommendation
            </Label>
            <Textarea
              id="summaryText"
              placeholder="Summary of results and recommendations; leverage SLE here as appropriate. e.g., is there data, a pivot, additional development or validation that could move this tech to 'proceed.' This recommendation is based on a triage level assessment of the technology to determine the path forward based on standard scoring criteria."
              value={data.summaryText}
              onChange={(e) => updateData({ summaryText: e.target.value })}
              className="mt-2 min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subject Matter Experts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Subject Matter Experts (Optional)</CardTitle>
            <Button onClick={addSME} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add SME
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            If subject matter experts (SMEs) are needed, please list who should be considered:
          </p>

          {data.subjectMatterExperts && data.subjectMatterExperts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.subjectMatterExperts.map((sme, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={sme.name}
                        onChange={(e) => updateSME(index, "name", e.target.value)}
                        placeholder="Expert name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={sme.expertise}
                        onChange={(e) => updateSME(index, "expertise", e.target.value)}
                        placeholder="Area of expertise"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={sme.contactInfo}
                        onChange={(e) => updateSME(index, "contactInfo", e.target.value)}
                        placeholder="Email or contact details"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => removeSME(index)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subject matter experts added yet. Click &ldquo;Add SME&rdquo; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Notice */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Reviewed & Approved by CCIV Review Committee on [date].</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              This form is <strong>PRIVILEGED AND CONFIDENTIAL</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}