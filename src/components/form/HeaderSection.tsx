import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "@/app/form/page";

interface HeaderSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function HeaderSection({ data, updateData }: HeaderSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please provide the basic information about the technology being evaluated.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="reviewer">Reviewer *</Label>
          <Input
            id="reviewer"
            value={data.reviewer}
            onChange={(e) => updateData({ reviewer: e.target.value })}
            placeholder="Enter reviewer name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technologyId">Technology ID # *</Label>
          <Input
            id="technologyId"
            value={data.technologyId}
            onChange={(e) => updateData({ technologyId: e.target.value })}
            placeholder="Enter technology ID number"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inventorsTitle">Inventor(s)/Title(s)/Dept *</Label>
        <Textarea
          id="inventorsTitle"
          value={data.inventorsTitle}
          onChange={(e) => updateData({ inventorsTitle: e.target.value })}
          placeholder="Enter inventor names, titles, and departments"
          rows={3}
          required
        />
        <p className="text-sm text-muted-foreground">
          List all inventors with their titles and departments
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="domainAssetClass">Domain/Asset Class *</Label>
        <Input
          id="domainAssetClass"
          value={data.domainAssetClass}
          onChange={(e) => updateData({ domainAssetClass: e.target.value })}
          placeholder="e.g., Medical Device, Software, Biologics, etc."
          required
        />
        <p className="text-sm text-muted-foreground">
          Specify the technology domain or asset classification
        </p>
      </div>
    </div>
  );
}