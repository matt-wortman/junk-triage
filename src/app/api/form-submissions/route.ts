import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubmissionStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      submittedBy,
      status = SubmissionStatus.DRAFT,
      responses,
      repeatGroups,
      calculatedScores
    } = body;

    console.log('📝 Creating form submission:', { templateId, submittedBy, status });

    // Create the form submission
    const submission = await prisma.formSubmission.create({
      data: {
        templateId,
        submittedBy,
        status,
        submittedAt: status === SubmissionStatus.SUBMITTED ? new Date() : null,
      },
    });

    console.log(`✅ Created form submission: ${submission.id}`);

    // Store individual question responses
    if (responses && Object.keys(responses).length > 0) {
      const responseEntries = Object.entries(responses).map(([questionCode, value]) => ({
        submissionId: submission.id,
        questionCode,
        value: JSON.stringify(value),
      }));

      await prisma.questionResponse.createMany({
        data: responseEntries,
      });

      console.log(`📝 Stored ${responseEntries.length} question responses`);
    }

    // Store repeatable group data
    if (repeatGroups && Object.keys(repeatGroups).length > 0) {
      const repeatGroupEntries: Array<{
        submissionId: string;
        questionCode: string;
        rowIndex: number;
        data: string;
      }> = [];

      for (const [questionCode, data] of Object.entries(repeatGroups)) {
        if (Array.isArray(data)) {
          data.forEach((rowData, index) => {
            repeatGroupEntries.push({
              submissionId: submission.id,
              questionCode,
              rowIndex: index,
              data: JSON.stringify(rowData),
            });
          });
        }
      }

      if (repeatGroupEntries.length > 0) {
        await prisma.repeatableGroupResponse.createMany({
          data: repeatGroupEntries,
        });

        console.log(`📋 Stored ${repeatGroupEntries.length} repeatable group entries`);
      }
    }

    // Store calculated scores (only valid numeric values)
    if (calculatedScores && Object.keys(calculatedScores).length > 0) {
      const scoreEntries = Object.entries(calculatedScores)
        .filter(([scoreType, value]) => {
          // Only include numeric scores, exclude text fields like recommendation/recommendationText
          const isNumeric = typeof value === 'number' && !isNaN(value) && isFinite(value);
          const isScoreField = scoreType.toLowerCase().includes('score');
          return isNumeric && isScoreField;
        })
        .map(([scoreType, value]) => ({
          submissionId: submission.id,
          scoreType,
          value: Number(value),
        }));

      if (scoreEntries.length > 0) {
        await prisma.calculatedScore.createMany({
          data: scoreEntries,
        });
      }

      console.log(`🎯 Stored ${scoreEntries.length} calculated scores`);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      status: submission.status,
    });

  } catch (error) {
    const err = error as Error;
    console.error('❌ Error creating form submission:', err.message);
    console.error('Stack trace:', err.stack);

    return NextResponse.json({
      success: false,
      error: 'Failed to save form submission',
      details: err.message,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');
    const templateId = searchParams.get('templateId');
    const submittedBy = searchParams.get('submittedBy');

    if (submissionId) {
      // Get specific submission
      const submission = await prisma.formSubmission.findUnique({
        where: { id: submissionId },
        include: {
          responses: true,
          repeatGroups: true,
          scores: true,
        },
      });

      if (!submission) {
        return NextResponse.json({
          success: false,
          error: 'Submission not found',
        }, { status: 404 });
      }

      // Transform the data back to the expected format
      const responses: Record<string, unknown> = {};
      submission.responses.forEach(response => {
        try {
          responses[response.questionCode] = JSON.parse(response.value as string);
        } catch {
          responses[response.questionCode] = response.value;
        }
      });

      const repeatGroups: Record<string, unknown[]> = {};
      submission.repeatGroups.forEach(group => {
        if (!repeatGroups[group.questionCode]) {
          repeatGroups[group.questionCode] = [];
        }
        try {
          repeatGroups[group.questionCode][group.rowIndex] = JSON.parse(group.data as string);
        } catch {
          repeatGroups[group.questionCode][group.rowIndex] = group.data;
        }
      });

      const calculatedScores: Record<string, number> = {};
      submission.scores.forEach(score => {
        calculatedScores[score.scoreType] = score.value;
      });

      return NextResponse.json({
        success: true,
        submission: {
          id: submission.id,
          templateId: submission.templateId,
          status: submission.status,
          submittedBy: submission.submittedBy,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          submittedAt: submission.submittedAt,
          responses,
          repeatGroups,
          calculatedScores,
        },
      });

    } else {
      // List submissions with optional filters
      const where: any = {};
      if (templateId) where.templateId = templateId;
      if (submittedBy) where.submittedBy = submittedBy;

      const submissions = await prisma.formSubmission.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: 50, // Limit to 50 most recent
        select: {
          id: true,
          templateId: true,
          status: true,
          submittedBy: true,
          createdAt: true,
          updatedAt: true,
          submittedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        submissions,
      });
    }

  } catch (error) {
    const err = error as Error;
    console.error('❌ Error fetching form submissions:', err.message);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch form submissions',
      details: err.message,
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submissionId,
      status,
      responses,
      repeatGroups,
      calculatedScores
    } = body;

    console.log('🔄 Updating form submission:', submissionId);

    // Update the submission
    const submission = await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        status: status || undefined,
        submittedAt: status === SubmissionStatus.SUBMITTED ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    // Clear existing responses and add new ones
    if (responses) {
      await prisma.questionResponse.deleteMany({
        where: { submissionId },
      });

      if (Object.keys(responses).length > 0) {
        const responseEntries = Object.entries(responses).map(([questionCode, value]) => ({
          submissionId,
          questionCode,
          value: JSON.stringify(value),
        }));

        await prisma.questionResponse.createMany({
          data: responseEntries,
        });
      }
    }

    // Clear existing repeat groups and add new ones
    if (repeatGroups) {
      await prisma.repeatableGroupResponse.deleteMany({
        where: { submissionId },
      });

      const repeatGroupEntries: Array<{
        submissionId: string;
        questionCode: string;
        rowIndex: number;
        data: string;
      }> = [];
      for (const [questionCode, data] of Object.entries(repeatGroups)) {
        if (Array.isArray(data)) {
          data.forEach((rowData, index) => {
            repeatGroupEntries.push({
              submissionId,
              questionCode,
              rowIndex: index,
              data: JSON.stringify(rowData),
            });
          });
        }
      }

      if (repeatGroupEntries.length > 0) {
        await prisma.repeatableGroupResponse.createMany({
          data: repeatGroupEntries,
        });
      }
    }

    // Update calculated scores
    if (calculatedScores) {
      await prisma.calculatedScore.deleteMany({
        where: { submissionId },
      });

      if (Object.keys(calculatedScores).length > 0) {
        const scoreEntries = Object.entries(calculatedScores)
          .filter(([scoreType, value]) => {
            // Only include numeric scores, exclude text fields like recommendation/recommendationText
            const isNumeric = typeof value === 'number' && !isNaN(value) && isFinite(value);
            const isScoreField = scoreType.toLowerCase().includes('score');
            return isNumeric && isScoreField;
          })
          .map(([scoreType, value]) => ({
            submissionId,
            scoreType,
            value: Number(value),
          }));

        if (scoreEntries.length > 0) {
          await prisma.calculatedScore.createMany({
            data: scoreEntries,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      status: submission.status,
    });

  } catch (error) {
    const err = error as Error;
    console.error('❌ Error updating form submission:', err.message);

    return NextResponse.json({
      success: false,
      error: 'Failed to update form submission',
      details: err.message,
    }, { status: 500 });
  }
}