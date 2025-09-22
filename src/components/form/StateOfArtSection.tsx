import { FormData } from "@/app/form/page";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoringComponent } from "./ScoringComponent";

interface StateOfArtSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function StateOfArtSection({ data, updateData }: StateOfArtSectionProps) {
  const stateOfArtCriteria = {
    0: "6+ sources of publicly available information in the specific technology domain and/or the technology is likely easily replicable and doesn't appear to have differentiating features based on current information available.",
    1: "4-6 sources of publicly available information in the specific technology domain and/or the technology has some potential differentiating features but likely can be replicated with moderate effort.",
    2: "1-3 sources of publicly available information in the specific technology domain and/or the technology has potential differentiating features and is likely difficult to replicate.",
    3: "Issued patent(s) with commercially relevant claims or 0 sources of publicly available information in the specific technology domain and/or the invention operates in a relatively new or unexplored technological space and is likely extremely difficult or impossible to replicate."
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">State of the Art</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The purpose of this section is to perform a cursory search for publicly available information in the specific technology domain. Specific findings should not be listed here. However, scores should be based upon what is found.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="stateOfArtText" className="text-base">
              Prior Art Assessment
            </Label>
            <Textarea
              id="stateOfArtText"
              placeholder="Summarize the findings from your prior art search without listing specific findings. Focus on the general landscape and differentiating potential..."
              value={data.stateOfArtText}
              onChange={(e) => updateData({ stateOfArtText: e.target.value })}
              className="mt-2 min-h-[120px]"
            />
          </div>

          <ScoringComponent
            label="State of the Art Score"
            value={data.stateOfArtScore}
            onChange={(score) => updateData({ stateOfArtScore: score })}
            criteria={stateOfArtCriteria}
          />
        </CardContent>
      </Card>
    </div>
  );
}