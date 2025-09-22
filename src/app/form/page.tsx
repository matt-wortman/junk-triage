"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import Link from "next/link";

// Form step components (will be created)
import { HeaderSection } from "@/components/form/HeaderSection";
import { TechnologyOverviewSection } from "@/components/form/TechnologyOverviewSection";
import { MissionAlignmentSection } from "@/components/form/MissionAlignmentSection";
import { UnmetNeedSection } from "@/components/form/UnmetNeedSection";
import { StateOfArtSection } from "@/components/form/StateOfArtSection";
import { MarketAnalysisSection } from "@/components/form/MarketAnalysisSection";
import { DigitalConsiderationsSection } from "@/components/form/DigitalConsiderationsSection";
import { ScoreRecommendationSection } from "@/components/form/ScoreRecommendationSection";
import { SummarySection } from "@/components/form/SummarySection";

export type FormData = {
  // Header section
  reviewer: string;
  technologyId: string;
  inventorsTitle: string;
  domainAssetClass: string;

  // Technology overview
  technologyOverview: string;

  // Mission alignment
  missionAlignmentText: string;
  missionAlignmentScore: number;

  // Unmet need
  unmetNeedText: string;
  unmetNeedScore: number;

  // State of the art
  stateOfArtText: string;
  stateOfArtScore: number;

  // Market analysis
  marketOverview: string;
  marketSizeScore: number;
  patientPopulationScore: number;
  competitorsScore: number;
  competitors: Array<{
    company: string;
    productDescription: string;
    productRevenue: string;
    pointOfContact: string;
  }>;

  // Digital considerations
  digitalQuestion1: boolean;
  digitalQuestion2: boolean;
  digitalQuestion3: boolean;
  digitalQuestion4: boolean;
  digitalScore: number;

  // Summary
  summaryText: string;
  subjectMatterExperts: Array<{
    name: string;
    expertise: string;
    contactInfo: string;
  }>;
};

const FORM_STEPS = [
  { id: 1, title: "Header Information", component: "header" },
  { id: 2, title: "Technology Overview", component: "overview" },
  { id: 3, title: "Mission Alignment", component: "mission" },
  { id: 4, title: "Unmet Need", component: "need" },
  { id: 5, title: "State of the Art", component: "art" },
  { id: 6, title: "Market Analysis", component: "market" },
  { id: 7, title: "Digital Considerations", component: "digital" },
  { id: 8, title: "Score & Recommendation", component: "score" },
  { id: 9, title: "Summary", component: "summary" },
];

export default function TriageFormPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    reviewer: "",
    technologyId: "",
    inventorsTitle: "",
    domainAssetClass: "",
    technologyOverview: "",
    missionAlignmentText: "",
    missionAlignmentScore: 0,
    unmetNeedText: "",
    unmetNeedScore: 0,
    stateOfArtText: "",
    stateOfArtScore: 0,
    marketOverview: "",
    marketSizeScore: 0,
    patientPopulationScore: 0,
    competitorsScore: 0,
    competitors: [],
    digitalQuestion1: false,
    digitalQuestion2: false,
    digitalQuestion3: false,
    digitalQuestion4: false,
    digitalScore: 0,
    summaryText: "",
    subjectMatterExperts: [],
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const progress = (currentStep / FORM_STEPS.length) * 100;

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    // TODO: Implement save draft functionality
    console.log("Saving draft...", formData);
  };

  const handleSubmit = async () => {
    // TODO: Implement form submission
    console.log("Submitting form...", formData);
  };

  const renderCurrentStep = () => {
    const step = FORM_STEPS[currentStep - 1];

    switch (step.component) {
      case "header":
        return <HeaderSection data={formData} updateData={updateFormData} />;
      case "overview":
        return <TechnologyOverviewSection data={formData} updateData={updateFormData} />;
      case "mission":
        return <MissionAlignmentSection data={formData} updateData={updateFormData} />;
      case "need":
        return <UnmetNeedSection data={formData} updateData={updateFormData} />;
      case "art":
        return <StateOfArtSection data={formData} updateData={updateFormData} />;
      case "market":
        return <MarketAnalysisSection data={formData} updateData={updateFormData} />;
      case "digital":
        return <DigitalConsiderationsSection data={formData} updateData={updateFormData} />;
      case "score":
        return <ScoreRecommendationSection data={formData} updateData={updateFormData} />;
      case "summary":
        return <SummarySection data={formData} updateData={updateFormData} />;
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-primary font-bold text-xl">✚</div>
              <span className="font-semibold text-lg">Technology Triage</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {FORM_STEPS.length}
              </span>
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Technology Triage Form</h1>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {FORM_STEPS[currentStep - 1].title}
            </h2>
            <div className="text-sm text-muted-foreground">
              {currentStep} / {FORM_STEPS.length}
            </div>
          </div>
        </div>

        {/* Form content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep === FORM_STEPS.length ? (
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4 mr-2" />
                Submit Form
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}