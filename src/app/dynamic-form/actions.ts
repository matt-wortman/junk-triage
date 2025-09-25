'use server'

import { prisma } from '@/lib/prisma'
import { SubmissionStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { FormResponse, RepeatableGroupData } from '@/lib/form-engine/types'
import { formSubmissionPayloadSchema } from '@/lib/validation/form-submission'

export interface FormSubmissionData {
  templateId: string
  responses: Record<string, unknown>
  repeatGroups: Record<string, unknown>
  calculatedScores?: Record<string, unknown>
}

export interface FormSubmissionResult {
  success: boolean
  submissionId?: string
  error?: string
}

/**
 * Submit a completed form response to the database
 */
export async function submitFormResponse(
  data: FormSubmissionData,
  userId: string = 'anonymous'
): Promise<FormSubmissionResult> {
  try {
    const payload = formSubmissionPayloadSchema.parse(data)

    // Start a database transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the form submission
      const submission = await tx.formSubmission.create({
        data: {
          templateId: payload.templateId,
          submittedBy: userId,
          status: SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      })

      // Store individual question responses
      const responseEntries = Object.entries(payload.responses).map(
        ([questionCode, value]) => ({
          submissionId: submission.id,
          questionCode,
          value: value as Prisma.InputJsonValue,
        })
      )

      if (responseEntries.length > 0) {
        await tx.questionResponse.createMany({
          data: responseEntries,
        })
      }

      // Store repeatable group responses
      const repeatGroupEntries = Object.entries(payload.repeatGroups).flatMap(
        ([questionCode, rows]) =>
          Array.isArray(rows)
            ? rows.map((rowData, index) => ({
                submissionId: submission.id,
                questionCode,
                rowIndex: index,
                data: rowData as Prisma.InputJsonValue,
              }))
            : []
      )

      if (repeatGroupEntries.length > 0) {
        await tx.repeatableGroupResponse.createMany({
          data: repeatGroupEntries,
        })
      }

      // Store calculated scores
      if (payload.calculatedScores && typeof payload.calculatedScores === 'object') {
        const scoreEntries = Object.entries(payload.calculatedScores)
          .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
          .map(([scoreType, value]) => ({
            submissionId: submission.id,
            scoreType,
            value: Number(value),
          }))

        if (scoreEntries.length > 0) {
          await tx.calculatedScore.createMany({
            data: scoreEntries,
          })
        }
      }

      return submission
    })

    // Revalidate the drafts page to reflect changes
    revalidatePath('/dynamic-form/drafts')

    return {
      success: true,
      submissionId: result.id,
    }
  } catch (error) {
    console.error('Error submitting form:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Save a draft form response to the database
 */
export async function saveDraftResponse(
  data: FormSubmissionData,
  userId: string = 'anonymous',
  existingDraftId?: string
): Promise<FormSubmissionResult> {
  try {
    const payload = formSubmissionPayloadSchema.parse(data)

    // Check if we're updating an existing draft
    if (existingDraftId) {
      const result = await prisma.$transaction(async (tx) => {
        // Update the existing submission
        const submission = await tx.formSubmission.update({
          where: { id: existingDraftId },
          data: {
            updatedAt: new Date(),
          },
        })

        // Delete existing responses and recreate them
        await tx.questionResponse.deleteMany({
          where: { submissionId: existingDraftId },
        })

        await tx.repeatableGroupResponse.deleteMany({
          where: { submissionId: existingDraftId },
        })

        await tx.calculatedScore.deleteMany({
          where: { submissionId: existingDraftId },
        })

        // Recreate responses (same logic as submitFormResponse)
        const responseEntries = Object.entries(payload.responses).map(([questionCode, value]) => ({
          submissionId: submission.id,
          questionCode,
          value: value as Prisma.InputJsonValue,
        }))

        if (responseEntries.length > 0) {
          await tx.questionResponse.createMany({
            data: responseEntries,
          })
        }

        const repeatGroupEntries = Object.entries(payload.repeatGroups).flatMap(([questionCode, rows]) => {
          if (Array.isArray(rows)) {
            return rows.map((rowData, index) => ({
              submissionId: submission.id,
              questionCode,
              rowIndex: index,
              data: rowData as Prisma.InputJsonValue,
            }))
          }
          return []
        })

        if (repeatGroupEntries.length > 0) {
          await tx.repeatableGroupResponse.createMany({
            data: repeatGroupEntries,
          })
        }

        if (payload.calculatedScores && typeof payload.calculatedScores === 'object') {
          const scoreEntries = Object.entries(payload.calculatedScores)
            .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
            .map(([scoreType, value]) => ({
              submissionId: submission.id,
              scoreType,
              value: Number(value),
            }))

          if (scoreEntries.length > 0) {
            await tx.calculatedScore.createMany({
              data: scoreEntries,
            })
          }
        }

        return submission
      })

      revalidatePath('/dynamic-form/drafts')

      return {
        success: true,
        submissionId: result.id,
      }
    } else {
      // Create new draft (same logic as submitFormResponse but with DRAFT status)
      const result = await prisma.$transaction(async (tx) => {
        const submission = await tx.formSubmission.create({
          data: {
            templateId: payload.templateId,
            submittedBy: userId,
            status: SubmissionStatus.DRAFT,
          },
        })

        const responseEntries = Object.entries(payload.responses).map(([questionCode, value]) => ({
          submissionId: submission.id,
          questionCode,
          value: value as Prisma.InputJsonValue,
        }))

        if (responseEntries.length > 0) {
          await tx.questionResponse.createMany({
            data: responseEntries,
          })
        }

        const repeatGroupEntries = Object.entries(payload.repeatGroups).flatMap(([questionCode, rows]) => {
          if (Array.isArray(rows)) {
            return rows.map((rowData, index) => ({
              submissionId: submission.id,
              questionCode,
              rowIndex: index,
              data: rowData as Prisma.InputJsonValue,
            }))
          }
          return []
        })

        if (repeatGroupEntries.length > 0) {
          await tx.repeatableGroupResponse.createMany({
            data: repeatGroupEntries,
          })
        }

        if (payload.calculatedScores && typeof payload.calculatedScores === 'object') {
          const scoreEntries = Object.entries(payload.calculatedScores)
            .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
            .map(([scoreType, value]) => ({
              submissionId: submission.id,
              scoreType,
              value: Number(value),
            }))

          if (scoreEntries.length > 0) {
            await tx.calculatedScore.createMany({
              data: scoreEntries,
            })
          }
        }

        return submission
      })

      revalidatePath('/dynamic-form/drafts')

      return {
        success: true,
        submissionId: result.id,
      }
    }
  } catch (error) {
    console.error('Error saving draft:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Load a draft form response from the database
 */
export async function loadDraftResponse(draftId: string, userId: string = 'anonymous') {
  try {
    const submission = await prisma.formSubmission.findFirst({
      where: {
        id: draftId,
        submittedBy: userId,
        status: SubmissionStatus.DRAFT,
      },
      include: {
        responses: true,
        repeatGroups: true,
        scores: true,
      },
    })

    if (!submission) {
      return {
        success: false,
        error: 'Draft not found or access denied',
      }
    }

    // Transform the data back to the format expected by the form
    const responses: FormResponse = {}
    submission.responses.forEach((response) => {
      responses[response.questionCode] = response.value as string | number | boolean | string[] | Record<string, unknown>
    })

    const repeatGroups: RepeatableGroupData = {}
    submission.repeatGroups.forEach((group) => {
      if (!repeatGroups[group.questionCode]) {
        repeatGroups[group.questionCode] = []
      }
      repeatGroups[group.questionCode][group.rowIndex] = group.data as Record<string, unknown>
    })

    const calculatedScores: Record<string, number> = {}
    submission.scores.forEach((score) => {
      calculatedScores[score.scoreType] = score.value
    })

    return {
      success: true,
      data: {
        templateId: submission.templateId,
        responses,
        repeatGroups,
        calculatedScores,
      },
      submissionId: submission.id,
    }
  } catch (error) {
    console.error('Error loading draft:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Delete a draft form response
 */
export async function deleteDraftResponse(draftId: string, userId: string = 'anonymous') {
  try {
    const submission = await prisma.formSubmission.findFirst({
      where: {
        id: draftId,
        submittedBy: userId,
        status: SubmissionStatus.DRAFT,
      },
    })

    if (!submission) {
      return {
        success: false,
        error: 'Draft not found or access denied',
      }
    }

    // Delete the submission (cascade will handle related records)
    await prisma.formSubmission.delete({
      where: { id: draftId },
    })

    revalidatePath('/dynamic-form/drafts')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting draft:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get all drafts for a user
 */
export async function getUserDrafts(userId: string = 'anonymous') {
  try {
    const drafts = await prisma.formSubmission.findMany({
      where: {
        submittedBy: userId,
        status: SubmissionStatus.DRAFT,
      },
      include: {
        template: {
          select: {
            name: true,
            version: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return {
      success: true,
      drafts: drafts.map((draft) => ({
        id: draft.id,
        templateName: draft.template.name,
        templateVersion: draft.template.version,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      })),
    }
  } catch (error) {
    console.error('Error fetching drafts:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
