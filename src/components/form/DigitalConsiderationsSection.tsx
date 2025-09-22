import { FormData } from "@/app/form/page";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DigitalConsiderationsSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

export function DigitalConsiderationsSection({ data, updateData }: DigitalConsiderationsSectionProps) {
  const digitalQuestions = [
    {
      id: "digitalQuestion1",
      question: "Does this solution use open source? Would this impact licensing?",
      value: data.digitalQuestion1
    },
    {
      id: "digitalQuestion2",
      question: "Are there algorithms, user interfaces, or databases being disclosed?",
      value: data.digitalQuestion2
    },
    {
      id: "digitalQuestion3",
      question: "Will Copyright or Trademark be sought?",
      value: data.digitalQuestion3
    },
    {
      id: "digitalQuestion4",
      question: "Has there been Documentation or SOPs created for these solutions?",
      value: data.digitalQuestion4
    }
  ];

  const handleQuestionChange = (questionId: string, checked: boolean) => {
    updateData({ [questionId]: checked });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Digital Considerations</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Considerations for Digital, Software, Data, Service, etc.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {digitalQuestions.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox
                  id={item.id}
                  checked={item.value}
                  onCheckedChange={(checked) => handleQuestionChange(item.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={item.id} className="text-base leading-relaxed cursor-pointer">
                    {index + 1}. {item.question}
                  </Label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>DISCLAIMER:</strong> The information presented here is not intended to be comprehensive.
              CCIV does not offer legal advice, and the information presented should not be relied on as such.
              Any official patentability search, analysis and/or opinion should be conducted by IP counsel,
              at the request of LM, when appropriate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}