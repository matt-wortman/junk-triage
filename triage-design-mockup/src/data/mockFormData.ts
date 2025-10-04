// Mock data structure for CCHMC Technology Triage Form
// This mimics the structure from the production form

export interface FormField {
  id: string;
  label: string;
  helpText?: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'table' | 'scoring' | 'checkbox' | 'radio';
  required?: boolean;
  options?: string[];
  scoringMin?: number;
  scoringMax?: number;
  scoringCriteria?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export const mockFormTemplate = {
  name: "CCHMC Technology Triage Form",
  description: "Cincinnati Children's Hospital Medical Center technology triage evaluation form - Complete version",
  version: "2.0.0",
  sections: [
    {
      id: "section-1",
      title: "Header and Identifiers",
      description: "Basic information about the technology and reviewer",
      fields: [
        {
          id: "tech-id",
          label: "Technology ID",
          helpText: "1111-2222",
          placeholder: "Enter technology ID",
          type: "text" as const,
          required: true,
        },
        {
          id: "invention-title",
          label: "Invention Title",
          helpText: "The name or title of the technology/invention",
          placeholder: "Enter invention title",
          type: "text" as const,
          required: true,
        },
        {
          id: "reviewer",
          label: "Reviewer",
          helpText: "Name of the person reviewing this technology",
          placeholder: "Enter reviewer name",
          type: "text" as const,
          required: true,
        },
        {
          id: "inventor",
          label: "Inventor",
          helpText: "",
          placeholder: "",
          type: "table" as const,
          required: false,
        },
        {
          id: "date",
          label: "Date",
          helpText: "Date of this evaluation",
          placeholder: "mm/dd/yyyy",
          type: "date" as const,
          required: true,
        },
        {
          id: "domain",
          label: "Domain or Asset Class",
          helpText: "Select the primary domain for this technology",
          placeholder: "Select an option",
          type: "select" as const,
          required: true,
          options: [
            "Medical Device",
            "Software/Digital Health",
            "Diagnostic Tool",
            "Therapeutic",
            "Research Tool",
          ],
        },
      ],
    },
    {
      id: "section-2",
      title: "Technology Overview",
      description: "Provide a comprehensive description of the technology",
      fields: [
        {
          id: "tech-overview",
          label: "Technology Description",
          helpText: "Describe the technology, its key features, and how it works",
          placeholder: "Enter a detailed description of the technology...",
          type: "textarea" as const,
          required: true,
        },
      ],
    },
    {
      id: "section-3",
      title: "Mission Alignment",
      description: "Evaluate alignment with organizational mission and child health impact",
      fields: [
        {
          id: "mission-text",
          label: "Mission Alignment Analysis",
          helpText: "Assess how this technology aligns with improving child health outcomes and organizational goals",
          placeholder: "Describe the mission alignment...",
          type: "textarea" as const,
          required: true,
        },
        {
          id: "mission-score",
          label: "Mission Alignment Score",
          helpText: "Rate the mission alignment on a 0-3 scale",
          type: "scoring" as const,
          required: true,
          scoringMin: 0,
          scoringMax: 3,
          scoringCriteria: "0 = No alignment, 1 = Minimal alignment, 2 = Good alignment, 3 = Excellent alignment",
        },
      ],
    },
    {
      id: "section-4",
      title: "Market Analysis",
      description: "Analyze the market opportunity and competitive landscape",
      fields: [
        {
          id: "market-overview",
          label: "Market Overview",
          helpText: "Describe the target market, size, and growth potential",
          placeholder: "Enter market analysis...",
          type: "textarea" as const,
          required: true,
        },
        {
          id: "competitor-table",
          label: "Competitor Analysis",
          helpText: "List major competitors and their offerings",
          type: "table" as const,
          required: false,
        },
        {
          id: "market-size",
          label: "Market Size Assessment",
          helpText: "Evaluate the total addressable market size",
          type: "scoring" as const,
          required: true,
          scoringMin: 0,
          scoringMax: 3,
          scoringCriteria: "0 = Very small market, 1 = Small market, 2 = Medium market, 3 = Large market",
        },
      ],
    },
    {
      id: "section-5",
      title: "Digital/Software Considerations",
      description: "Answer specific questions about digital and software aspects",
      fields: [
        {
          id: "digital-q1",
          label: "Does this technology involve software development?",
          type: "radio" as const,
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "digital-q2",
          label: "Will this require cloud infrastructure?",
          type: "radio" as const,
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "digital-q3",
          label: "Does this involve protected health information (PHI)?",
          type: "radio" as const,
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "digital-q4",
          label: "Will this require FDA regulatory approval?",
          type: "radio" as const,
          required: true,
          options: ["Yes", "No"],
        },
      ],
    },
  ],
  currentSection: 0,
  totalSections: 7,
  progress: 14,
};
