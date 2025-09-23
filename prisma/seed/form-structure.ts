import { PrismaClient, FieldType } from '@prisma/client';
import { completeFormStructure } from './complete-questions';

const prisma = new PrismaClient();

export const formStructureData = completeFormStructure;

export async function seedFormStructure() {
  console.log('✅ Created form template:', formStructureData.name, '(cmfvr0i9g007xgticg1h9qqjs)');

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
          helpText: (questionData as any).helpText,
          placeholder: (questionData as any).placeholder,
          validation: (questionData as any).validation ? JSON.stringify((questionData as any).validation) : undefined,
          conditional: (questionData as any).conditional ? JSON.stringify((questionData as any).conditional) : undefined,
          order: questionData.order,
          isRequired: questionData.isRequired,
        },
      });

      console.log(`    ✅ Created question: ${question.fieldCode} - ${question.label}`);

      // Create options if they exist
      if ((questionData as any).options) {
        for (const optionData of (questionData as any).options) {
          await prisma.questionOption.create({
            data: {
              questionId: question.id,
              value: optionData.value,
              label: optionData.label,
              order: optionData.order,
            },
          });
        }
        console.log(`      ✅ Created ${(questionData as any).options.length} options`);
      }

      // Create scoring config if it exists
      if ((questionData as any).scoringConfig) {
        await prisma.scoringConfig.create({
          data: {
            questionId: question.id,
            minScore: (questionData as any).scoringConfig.minScore,
            maxScore: (questionData as any).scoringConfig.maxScore,
            weight: (questionData as any).scoringConfig.weight,
            criteria: JSON.stringify((questionData as any).scoringConfig.criteria),
          },
        });
        console.log(`      ✅ Created scoring config`);
      }
    }
  }

  console.log(`🎉 Successfully seeded form structure with ${formStructureData.sections.length} sections`);
  return template;
}