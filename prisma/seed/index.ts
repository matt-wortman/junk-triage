import { seedFormStructure } from './form-structure';
import { seedDemoSubmissions } from './demo-submissions';
import { getPrismaClient } from './prisma-factory';
import { seedQuestionDictionary } from './question-dictionary';

const prisma = getPrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check environment variables
  const runPrismaSeed = process.env.RUN_PRISMA_SEED !== 'false';
  const seedDemoData = process.env.SEED_DEMO_DATA !== 'false'; // Default to true

  if (!runPrismaSeed) {
    console.log('⏭️  Skipping database seed (RUN_PRISMA_SEED=false)');
    return;
  }

  try {
    // Seed question dictionary entries (idempotent)
    console.log('📚 Seeding question dictionary...');
    await seedQuestionDictionary(prisma);

    // Clear existing dynamic form data
    console.log('🧹 Clearing existing dynamic form data...');
    await prisma.formSubmission.deleteMany();
    await prisma.questionOption.deleteMany();
    await prisma.scoringConfig.deleteMany();
    await prisma.formQuestion.deleteMany();
    await prisma.formSection.deleteMany();
    await prisma.formTemplate.deleteMany();

    // Seed the form structure
    console.log('📝 Seeding form structure...');
    const template = await seedFormStructure(prisma);

    console.log(`✅ Successfully seeded form template: ${template.name} (${template.id})`);

    // Conditionally seed demo data
    if (seedDemoData) {
      console.log('🎭 Seeding demo data...');
      await seedDemoSubmissions(template.id, prisma);
      console.log('✨ Demo data seeded successfully!');
    } else {
      console.log('⏭️  Skipping demo data seed (SEED_DEMO_DATA=false)');
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
