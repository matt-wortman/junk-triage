import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "@/app/form/page";
import { useState, useEffect } from "react";

interface TechnologyOverviewSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function TechnologyOverviewSection({ data, updateData }: TechnologyOverviewSectionProps) {
  const [characterCount, setCharacterCount] = useState(data.technologyOverview.length);

  useEffect(() => {
    setCharacterCount(data.technologyOverview.length);
  }, [data.technologyOverview]);

  const handleTextChange = (value: string) => {
    updateData({ technologyOverview: value });
    setCharacterCount(value.length);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Technology Overview</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Provide a comprehensive overview of the technology description, target users,
          functionality, problems addressed, and current development stage. This should be
          a concise version of the invention disclosure and a clear overview of what the
          licensable asset represents.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologyOverview">Technology Description *</Label>
        <Textarea
          id="technologyOverview"
          value={data.technologyOverview}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Describe the technology including:
• Who it is for (target users/patients)
• How it works (mechanism/functionality)
• What problem it addresses (clinical/technical need)
• Current stage of development
• What makes it a licensable asset"
          rows={12}
          className="min-h-[300px]"
          required
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Provide a clear, comprehensive description of the technology
          </p>
          <span className="text-sm text-muted-foreground">
            {characterCount.toLocaleString()} characters
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for a strong overview:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific about the clinical or technical problem being solved</li>
          <li>• Explain the mechanism of action or how the technology works</li>
          <li>• Identify the target patient population or user group</li>
          <li>• Describe the current development stage and any validation completed</li>
          <li>• Highlight what makes this technology unique or differentiated</li>
        </ul>
      </div>
    </div>
  );
}