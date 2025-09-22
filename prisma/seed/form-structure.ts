import { PrismaClient, FieldType } from '@prisma/client';

const prisma = new PrismaClient();

export const formStructureData = {
  name: "CCHMC Technology Triage Form",
  version: "1.0.0",
  description: "Cincinnati Children's Hospital Medical Center technology triage evaluation form",
  isActive: true,
  sections: [
    {
      code: "F0",
      title: "Header and Identifiers",
      description: "Basic information about the technology and reviewer",
      order: 0,
      isRequired: true,
      questions: [
        {
          fieldCode: "F0.1",
          label: "Reviewer",
          type: FieldType.SHORT_TEXT,
          helpText: "Name of the person reviewing this technology",
          placeholder: "Enter reviewer name",
          order: 1,
          isRequired: true,
        },
        {
          fieldCode: "F0.2",
          label: "Technology ID #",
          type: FieldType.SHORT_TEXT,
          helpText: "Unique identifier for this technology",
          placeholder: "Enter technology ID",
          order: 2,
          isRequired: true,
        },
        {
          fieldCode: "F0.3",
          label: "Inventor(s)/Title(s)/Dept",
          type: FieldType.LONG_TEXT,
          helpText: "Information about the inventors and their departments",
          placeholder: "Enter inventor details",
          order: 3,
          isRequired: true,
        },
        {
          fieldCode: "F0.4",
          label: "Domain or Asset Class",
          type: FieldType.SINGLE_SELECT,
          helpText: "Select the primary domain for this technology",
          order: 4,
          isRequired: true,
          options: [
            { value: "medical_device", label: "Medical Device", order: 1 },
            { value: "therapeutic", label: "Therapeutic", order: 2 },
            { value: "diagnostic", label: "Diagnostic", order: 3 },
            { value: "digital_health", label: "Digital Health", order: 4 },
            { value: "research_tool", label: "Research Tool", order: 5 },
            { value: "other", label: "Other", order: 6 },
          ],
        },
      ],
    },
    {
      code: "F1",
      title: "Technology Overview",
      description: "Detailed description of the technology",
      order: 1,
      isRequired: true,
      questions: [
        {
          fieldCode: "F1.1",
          label: "Technology Overview",
          type: FieldType.LONG_TEXT,
          helpText: "Provide a comprehensive description of the technology, its purpose, and how it works",
          placeholder: "Describe the technology in detail...",
          order: 1,
          isRequired: true,
        },
      ],
    },
    {
      code: "F2",
      title: "Mission Alignment",
      description: "Assessment of alignment with organizational mission",
      order: 2,
      isRequired: true,
      questions: [
        {
          fieldCode: "F2.1",
          label: "Mission Alignment Analysis",
          type: FieldType.LONG_TEXT,
          helpText: "Analyze how this technology aligns with CCHMC's mission for child health",
          placeholder: "Describe mission alignment...",
          order: 1,
          isRequired: true,
        },
        {
          fieldCode: "F2.2",
          label: "Mission Alignment Score",
          type: FieldType.SCORING_0_3,
          helpText: "Rate the alignment with organizational mission (0-3 scale)",
          order: 2,
          isRequired: true,
          scoringConfig: {
            minScore: 0,
            maxScore: 3,
            weight: 0.5, // 50% weight in Impact score
            criteria: {
              "0": "No clear alignment with mission",
              "1": "Limited alignment with mission",
              "2": "Good alignment with mission",
              "3": "Excellent alignment with mission"
            }
          }
        },
      ],
    },
    {
      code: "F3",
      title: "Unmet Need",
      description: "Assessment of clinical need addressed by the technology",
      order: 3,
      isRequired: true,
      questions: [
        {
          fieldCode: "F3.1",
          label: "Unmet Need Analysis",
          type: FieldType.LONG_TEXT,
          helpText: "Describe the clinical need this technology addresses",
          placeholder: "Describe the unmet need...",
          order: 1,
          isRequired: true,
        },
        {
          fieldCode: "F3.2",
          label: "Unmet Need Score",
          type: FieldType.SCORING_0_3,
          helpText: "Rate the significance of the unmet need (0-3 scale)",
          order: 2,
          isRequired: true,
          scoringConfig: {
            minScore: 0,
            maxScore: 3,
            weight: 0.5, // 50% weight in Impact score
            criteria: {
              "0": "No significant unmet need",
              "1": "Limited unmet need",
              "2": "Moderate unmet need",
              "3": "Critical unmet need"
            }
          }
        },
      ],
    },
    {
      code: "F4",
      title: "State of the Art",
      description: "Analysis of existing solutions and competitive landscape",
      order: 4,
      isRequired: true,
      questions: [
        {
          fieldCode: "F4.1",
          label: "State of the Art Analysis",
          type: FieldType.LONG_TEXT,
          helpText: "Analyze existing solutions and how this technology compares",
          placeholder: "Describe the current state of the art...",
          order: 1,
          isRequired: true,
        },
        {
          fieldCode: "F4.2",
          label: "State of the Art Score",
          type: FieldType.SCORING_0_3,
          helpText: "Rate the differentiation from existing solutions (0-3 scale)",
          order: 2,
          isRequired: true,
          scoringConfig: {
            minScore: 0,
            maxScore: 3,
            weight: 0.5, // 50% weight in Value score
            criteria: {
              "0": "No differentiation from existing solutions",
              "1": "Limited differentiation",
              "2": "Good differentiation",
              "3": "Significant differentiation"
            }
          }
        },
      ],
    },
    {
      code: "F5",
      title: "Market Analysis",
      description: "Market size, competition, and commercial potential assessment",
      order: 5,
      isRequired: true,
      questions: [
        {
          fieldCode: "F5.1",
          label: "Market Overview",
          type: FieldType.LONG_TEXT,
          helpText: "Provide an overview of the target market",
          placeholder: "Describe the market landscape...",
          order: 1,
          isRequired: true,
        },
        {
          fieldCode: "F5.2",
          label: "Market Size Score",
          type: FieldType.SCORING_0_3,
          helpText: "Rate the total addressable market size (0-3 scale)",
          order: 2,
          isRequired: true,
          scoringConfig: {
            minScore: 0,
            maxScore: 3,
            weight: 1.0,
            criteria: {
              "0": "Very small market (<$10M)",
              "1": "Small market ($10M-$100M)",
              "2": "Medium market ($100M-$1B)",
              "3": "Large market (>$1B)"
            }
          }
        },
        {
          fieldCode: "F5.3",
          label: "Patient Population Score",
          type: FieldType.SCORING_0_3,
          helpText: "Rate the size of the patient population (0-3 scale)",
          order: 3,
          isRequired: true,
          scoringConfig: {
            minScore: 0,
            maxScore: 3,
            weight: 1.0,
            criteria: {
              "0": "Very small population (<1,000)",
              "1": "Small population (1,000-10,000)",
              "2": "Medium population (10,000-100,000)",
              "3": "Large population (>100,000)"
            }
          }
        },
        {
          fieldCode: "F5.4",
          label: "Number of Competitors Score",
          type: FieldType.SCORING_0_3,
          helpText: "Rate the competitive landscape (0-3 scale, inverse scoring)",
          order: 4,
          isRequired: true,
          scoringConfig: {
            minScore: 0,
            maxScore: 3,
            weight: 1.0,
            criteria: {
              "0": "Many competitors (>10)",
              "1": "Several competitors (5-10)",
              "2": "Few competitors (2-4)",
              "3": "No/minimal competition (0-1)"
            }
          }
        },
        {
          fieldCode: "F5.5",
          label: "Competitor Information",
          type: FieldType.REPEATABLE_GROUP,
          helpText: "Add information about competing companies and products",
          order: 5,
          isRequired: false,
        },
      ],
    },
    {
      code: "F6",
      title: "Digital/Software Considerations",
      description: "Technology-specific considerations for digital and software technologies",
      order: 6,
      isRequired: true,
      questions: [
        {
          fieldCode: "F6.1",
          label: "Does this technology include software or digital components?",
          type: FieldType.CHECKBOX_GROUP,
          helpText: "Select all that apply",
          placeholder: undefined,
          order: 1,
          isRequired: false,
          options: [
            { value: "software", label: "Software application", order: 1 },
            { value: "algorithm", label: "Algorithm or AI/ML component", order: 2 },
            { value: "data", label: "Data collection or analysis", order: 3 },
            { value: "platform", label: "Digital platform or system", order: 4 },
          ],
        },
      ],
    },
    {
      code: "F7",
      title: "Score & Recommendation",
      description: "Auto-calculated scores and recommendation matrix",
      order: 7,
      isRequired: true,
      questions: [
        {
          fieldCode: "F7.1",
          label: "Impact Score",
          type: FieldType.INTEGER,
          helpText: "Auto-calculated: (Mission Alignment × 50%) + (Unmet Need × 50%)",
          order: 1,
          isRequired: false,
        },
        {
          fieldCode: "F7.2",
          label: "Value Score",
          type: FieldType.INTEGER,
          helpText: "Auto-calculated: (State of Art × 50%) + (Market Score × 50%)",
          order: 2,
          isRequired: false,
        },
        {
          fieldCode: "F7.3",
          label: "Recommendation",
          type: FieldType.SHORT_TEXT,
          helpText: "Auto-generated based on Impact vs Value matrix",
          order: 3,
          isRequired: false,
        },
      ],
    },
    {
      code: "F8",
      title: "Summary",
      description: "Final summary and subject matter expert recommendations",
      order: 8,
      isRequired: true,
      questions: [
        {
          fieldCode: "F8.1",
          label: "Summary and Assessment",
          type: FieldType.LONG_TEXT,
          helpText: "Provide a final summary of the technology assessment",
          placeholder: "Enter final assessment...",
          order: 1,
          isRequired: false,
        },
        {
          fieldCode: "F8.2",
          label: "Subject Matter Experts",
          type: FieldType.REPEATABLE_GROUP,
          helpText: "Add recommended subject matter experts for further evaluation",
          order: 2,
          isRequired: false,
        },
      ],
    },
  ],
};

export async function seedFormStructure() {
  try {
    // Create the form template
    const template = await prisma.formTemplate.create({
      data: {
        name: formStructureData.name,
        version: formStructureData.version,
        description: formStructureData.description,
        isActive: formStructureData.isActive,
      },
    });

    console.log(`✅ Created form template: ${template.name} (${template.id})`);

    // Create sections and questions
    for (const sectionData of formStructureData.sections) {
      const section = await prisma.formSection.create({
        data: {
          templateId: template.id,
          code: sectionData.code,
          title: sectionData.title,
          description: sectionData.description,
          order: sectionData.order,
          isRequired: sectionData.isRequired,
        },
      });

      console.log(`  ✅ Created section: ${section.code} - ${section.title}`);

      // Create questions for this section
      for (const questionData of sectionData.questions) {
        const question = await prisma.formQuestion.create({
          data: {
            sectionId: section.id,
            fieldCode: questionData.fieldCode,
            label: questionData.label,
            type: questionData.type,
            helpText: questionData.helpText,
            placeholder: 'placeholder' in questionData ? questionData.placeholder : null,
            order: questionData.order,
            isRequired: questionData.isRequired,
          },
        });

        console.log(`    ✅ Created question: ${question.fieldCode} - ${question.label}`);

        // Create options if they exist
        if ('options' in questionData && questionData.options) {
          for (const optionData of questionData.options) {
            await prisma.questionOption.create({
              data: {
                questionId: question.id,
                value: optionData.value,
                label: optionData.label,
                order: optionData.order,
              },
            });
          }
          console.log(`      ✅ Created ${questionData.options.length} options`);
        }

        // Create scoring config if it exists
        if ('scoringConfig' in questionData && questionData.scoringConfig) {
          await prisma.scoringConfig.create({
            data: {
              questionId: question.id,
              minScore: questionData.scoringConfig.minScore,
              maxScore: questionData.scoringConfig.maxScore,
              weight: questionData.scoringConfig.weight,
              criteria: questionData.scoringConfig.criteria,
            },
          });
          console.log(`      ✅ Created scoring config`);
        }
      }
    }

    console.log(`🎉 Successfully seeded form structure with ${formStructureData.sections.length} sections`);
    return template;
  } catch (error) {
    console.error('❌ Error seeding form structure:', error);
    throw error;
  }
}

export default seedFormStructure;