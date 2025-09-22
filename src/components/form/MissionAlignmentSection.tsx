import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "@/app/form/page";
import { ScoringComponent } from "./ScoringComponent";

interface MissionAlignmentSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

const MISSION_ALIGNMENT_CRITERIA = {
  0: "Does NOT align with any of the following: Improves Child Health, Transforms Delivery of Care, Aligns with POPT Goals",
  1: "Aligns with 1 of the following: Improves Child Health, Transforms Delivery of Care, Aligns with at least 1 POPT Goal",
  2: "Aligns with 2 of the following: Improves Child Health, Transforms Delivery of Care, Aligns with at least 1 POPT Goal",
  3: "Aligns with ALL of the following: Improves Child Health, Transforms Delivery of Care, Aligns with at least 1 POPT Goal"
};

export function MissionAlignmentSection({ data, updateData }: MissionAlignmentSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mission Alignment</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Evaluate how well this technology aligns with Cincinnati Children's mission
          and strategic goals. Consider child health impact, care delivery transformation,
          and alignment with POPT (Portfolio of the Future) goals.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="missionAlignmentText">
          Mission Alignment Explanation *
        </Label>
        <Textarea
          id="missionAlignmentText"
          value={data.missionAlignmentText}
          onChange={(e) => updateData({ missionAlignmentText: e.target.value })}
          placeholder="Explain how this technology:
• Improves child health outcomes
• Transforms delivery of care
• Aligns with CCHMC POPT goals (refer to supplemental document)

Be specific about the impact and alignment."
          rows={6}
          required
        />
        <p className="text-sm text-muted-foreground">
          Reference the supplemental POPT document when explaining strategic alignment
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">🎯 Key Alignment Areas:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Improves Child Health:</strong> Direct impact on pediatric health outcomes</li>
          <li>• <strong>Transforms Delivery of Care:</strong> Changes how care is provided or accessed</li>
          <li>• <strong>POPT Goals:</strong> Aligns with Portfolio of the Future strategic objectives</li>
        </ul>
      </div>

      <ScoringComponent
        label="Mission Alignment Score"
        value={data.missionAlignmentScore}
        onChange={(score) => updateData({ missionAlignmentScore: score })}
        criteria={MISSION_ALIGNMENT_CRITERIA}
      />

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> All scoring categories are assessed on a 0-3 scale based on
          the criteria provided in Exhibit A of the original form. Scores contribute to the
          overall Impact calculation (Mission Alignment 50% + Unmet Need 50%).
        </p>
      </div>
    </div>
  );
}