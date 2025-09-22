import { PrismaClient } from '@prisma/client';
import { seedFormStructure } from './form-structure';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing dynamic form data
    console.log('🧹 Clearing existing dynamic form data...');
    await prisma.questionOption.deleteMany();
    await prisma.scoringConfig.deleteMany();
    await prisma.formQuestion.deleteMany();
    await prisma.formSection.deleteMany();
    await prisma.formTemplate.deleteMany();

    // Seed the form structure
    console.log('📝 Seeding form structure...');
    const template = await seedFormStructure();

    console.log(`✅ Successfully seeded form template: ${template.name} (${template.id})`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();