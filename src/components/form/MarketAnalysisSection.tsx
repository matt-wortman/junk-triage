import { FormData } from "@/app/form/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScoringComponent } from "./ScoringComponent";
import { Trash2, Plus } from "lucide-react";

interface MarketAnalysisSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function MarketAnalysisSection({ data, updateData }: MarketAnalysisSectionProps) {
  const marketSizeCriteria = {
    0: "Small Molecules: <$50M, Biologics/Cell/Gene: <$50M, Medical Device: <$25M, Diagnostics: <$10M, Digital Health: <$25M",
    1: "Small Molecules: $50M-$250M, Biologics/Cell/Gene: $50M-$250M, Medical Device: $25M-$125M, Diagnostics: $10M-$50M, Digital Health: $25M-$100M",
    2: "Small Molecules: $250M-$500M, Biologics/Cell/Gene: $250M-$500M, Medical Device: $125M-$250M, Diagnostics: $50M-$125M, Digital Health: $100M-$250M",
    3: "Small Molecules: >$500M, Biologics/Cell/Gene: >$500M, Medical Device: >$250M, Diagnostics: >$250M, Digital Health: >$250M"
  };

  const patientPopulationCriteria = {
    0: "<200K (for orphan disease, multiply by 10)",
    1: "200K-1M (for orphan disease, multiply by 10)",
    2: "1-2.5M (for orphan disease, multiply by 10)",
    3: ">2.5M (for orphan disease, multiply by 10)"
  };

  const competitorsCriteria = {
    0: ">15 direct/indirect competitors",
    1: "11-15 direct/indirect competitors",
    2: "5-10 direct/indirect competitors",
    3: "<5 direct/indirect competitors"
  };

  const addCompetitor = () => {
    const newCompetitor = {
      company: "",
      productDescription: "",
      productRevenue: "",
      pointOfContact: ""
    };
    updateData({
      competitors: [...(data.competitors || []), newCompetitor]
    });
  };

  const updateCompetitor = (index: number, field: string, value: string) => {
    const updatedCompetitors = [...(data.competitors || [])];
    updatedCompetitors[index] = { ...updatedCompetitors[index], [field]: value };
    updateData({ competitors: updatedCompetitors });
  };

  const removeCompetitor = (index: number) => {
    const updatedCompetitors = [...(data.competitors || [])];
    updatedCompetitors.splice(index, 1);
    updateData({ competitors: updatedCompetitors });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Market Analysis</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of the market including size, trends, competitive landscape, stakeholder mapping, and regulatory considerations.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="marketOverview" className="text-base">
              Market Overview
            </Label>
            <Textarea
              id="marketOverview"
              placeholder="Market Size (TAM) and Trends: Understand the target market's size, growth potential, patient population size or procedures, total revenue, price/unit or procedure, reimbursement rates. Include stakeholder mapping and regulatory landscape. Use hyperlinks where applicable."
              value={data.marketOverview || ""}
              onChange={(e) => updateData({ marketOverview: e.target.value })}
              className="mt-2 min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitive Landscape Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Identify known companies in the space and existing solutions with their strengths and weaknesses.
            </p>
            <Button onClick={addCompetitor} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>

          {data.competitors && data.competitors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Product Description</TableHead>
                  <TableHead>Product Revenue</TableHead>
                  <TableHead>Point of Contact</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.competitors.map((competitor, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={competitor.company}
                        onChange={(e) => updateCompetitor(index, "company", e.target.value)}
                        placeholder="Company name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={competitor.productDescription}
                        onChange={(e) => updateCompetitor(index, "productDescription", e.target.value)}
                        placeholder="Product description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={competitor.productRevenue}
                        onChange={(e) => updateCompetitor(index, "productRevenue", e.target.value)}
                        placeholder="Revenue"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={competitor.pointOfContact}
                        onChange={(e) => updateCompetitor(index, "pointOfContact", e.target.value)}
                        placeholder="Contact info"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => removeCompetitor(index)}
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
              No competitors added yet. Click &ldquo;Add Competitor&rdquo; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Market Scoring</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            The overall Market score will be automatically calculated based on each score for market sub-criteria.
          </p>

          <ScoringComponent
            label="Market Size - Revenue (TAM)"
            value={data.marketSizeScore || 0}
            onChange={(score) => updateData({ marketSizeScore: score })}
            criteria={marketSizeCriteria}
          />

          <ScoringComponent
            label="Patient Population"
            value={data.patientPopulationScore || 0}
            onChange={(score) => updateData({ patientPopulationScore: score })}
            criteria={patientPopulationCriteria}
          />

          <ScoringComponent
            label="Number of Direct/Indirect Competitors"
            value={data.competitorsScore || 0}
            onChange={(score) => updateData({ competitorsScore: score })}
            criteria={competitorsCriteria}
          />

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Overall Market Score:</span>
              <span className="text-lg font-bold text-primary">
                {((data.marketSizeScore || 0) + (data.patientPopulationScore || 0) + (data.competitorsScore || 0)) / 3 || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Calculated as average of Market Size, Patient Population, and Competitors scores
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}