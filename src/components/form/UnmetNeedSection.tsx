import { FormData } from "@/app/form/page";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoringComponent } from "./ScoringComponent";

interface UnmetNeedSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function UnmetNeedSection({ data, updateData }: UnmetNeedSectionProps) {
  const unmetNeedCriteria = {
    0: "Need doesn't exist, is already met by existing products, or there are ≥6 products in Phase 2 or 3 clinical trials addressing the same need and there is no significant rationale for an additional product.",
    1: "Need is not met by existing products, but there are ≥4 products in Phase 2 or 3 clinical trials. The proposed product has the potential to provide similar benefits to the current standard of care or those in development (e.g., Me Too Product).",
    2: "Need is not met by existing products, and there are ≤3 products in Phase 2 or 3 clinical trials. The proposed product has the potential to provide an incremental improvement over the current standard of care or those in development.",
    3: "Need is not met by existing products, and there are ≤1 product in Phase 2 or 3 clinical trials. The proposed product has the potential to be transformative to the current standard of care or those in development."
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Unmet Need</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Is there an unmet need? Briefly explain, including the potential clinical impact of the technology. If a diagnostic, is there clinical utility? Briefly explain.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="unmetNeedText" className="text-base">
              Unmet Need Analysis
            </Label>
            <Textarea
              id="unmetNeedText"
              placeholder="Describe the unmet need, including potential clinical impact and clinical utility for diagnostics..."
              value={data.unmetNeedText}
              onChange={(e) => updateData({ unmetNeedText: e.target.value })}
              className="mt-2 min-h-[120px]"
            />
          </div>

          <ScoringComponent
            label="Unmet Need Score"
            value={data.unmetNeedScore}
            onChange={(score) => updateData({ unmetNeedScore: score })}
            criteria={unmetNeedCriteria}
          />
        </CardContent>
      </Card>
    </div>
  );
}