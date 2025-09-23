import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('🔍 API: Starting form template fetch...');

  try {
    console.log('🔗 API: Testing database connection...');

    // Test basic connection first
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ API: Database connection successful:', connectionTest);

    console.log('📊 API: Checking for form templates...');

    // Check if any templates exist
    const templateCount = await prisma.formTemplate.count();
    console.log(`📊 API: Found ${templateCount} total form templates`);

    const activeTemplateCount = await prisma.formTemplate.count({
      where: { isActive: true }
    });
    console.log(`📊 API: Found ${activeTemplateCount} active form templates`);

    if (activeTemplateCount === 0) {
      console.log('❌ API: No active templates found');
      return NextResponse.json({ error: 'No active form template found' }, { status: 404 });
    }

    console.log('🔍 API: Fetching template with full structure...');

    const template = await prisma.formTemplate.findFirst({
      where: { isActive: true },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                },
                scoringConfig: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      console.log('❌ API: Template query returned null');
      return NextResponse.json({ error: 'No active form template found' }, { status: 404 });
    }

    console.log(`✅ API: Successfully loaded template: ${template.name} with ${template.sections?.length || 0} sections`);

    return NextResponse.json(template);
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error('❌ API: Detailed error loading form template:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    if (err.code) {
      console.error('Error code:', err.code);
    }

    return NextResponse.json({
      error: 'Failed to load form template',
      details: err.message || 'Unknown error'
    }, { status: 500 });
  }
}