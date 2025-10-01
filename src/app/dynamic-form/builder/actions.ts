'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Prisma, FieldType } from '@prisma/client'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(1000).optional(),
})

const idSchema = z.string().min(1)
const sectionContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().max(1000).optional(),
  code: z.string().min(1, 'Code is required'),
})

const fieldOptionInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Option label is required'),
  value: z.string().min(1, 'Option value is required'),
})

const fieldUpdateSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  helpText: z.string().max(2000).optional(),
  placeholder: z.string().max(255).optional(),
  isRequired: z.boolean().default(false),
  options: z.array(fieldOptionInputSchema).optional(),
})

const templateMetadataSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().max(2000).optional(),
})

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

const templateMetadataSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().max(2000).optional(),
})

export async function getTemplates() {
  return prisma.formTemplate.findMany({
    include: {
      _count: {
        select: {
          sections: true,
          submissions: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export type TemplateListItem = Awaited<ReturnType<typeof getTemplates>>[number]

export async function getTemplateDetail(templateId: string) {
  return prisma.formTemplate.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
              scoringConfig: true,
            },
          },
        },
      },
    },
  })
}

export type TemplateDetail = NonNullable<Awaited<ReturnType<typeof getTemplateDetail>>>

export type SectionInput = z.infer<typeof sectionContentSchema>

async function invalidateTemplate(templateId: string) {
  revalidatePath(`/dynamic-form/builder/${templateId}`)
}

export async function createSection(templateId: string, input: SectionInput): Promise<ActionResult> {
  try {
    const parsedId = idSchema.parse(templateId)
    const parsedInput = sectionContentSchema.parse(input)

    const maxOrderSection = await prisma.formSection.findFirst({
      where: { templateId: parsedId },
      orderBy: { order: 'desc' },
    })

    await prisma.formSection.create({
      data: {
        templateId: parsedId,
        order: (maxOrderSection?.order ?? 0) + 1,
        title: parsedInput.title,
        description: parsedInput.description,
        code: parsedInput.code,
      },
    })

    await invalidateTemplate(parsedId)
    return { success: true }
  } catch (error) {
    console.error('createSection failed', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to create section',
    }
  }
}

export async function updateSection(sectionId: string, input: SectionInput) {
  const parsedId = idSchema.parse(sectionId)
  const parsedInput = sectionContentSchema.parse(input)

  const section = await prisma.formSection.update({
    where: { id: parsedId },
    data: {
      title: parsedInput.title,
      description: parsedInput.description,
      code: parsedInput.code,
    },
  })

  await invalidateTemplate(section.templateId)
  return section
}

export async function deleteSection(sectionId: string) {
  const parsedId = idSchema.parse(sectionId)
  const deleted = await prisma.formSection.delete({ where: { id: parsedId } })
  await invalidateTemplate(deleted.templateId)
}

export async function reorderSections(templateId: string, orderedIds: string[]) {
  const parsedId = idSchema.parse(templateId)
  if (orderedIds.length === 0) return

  await prisma.$transaction(
    orderedIds.map((sectionId, index) =>
      prisma.formSection.update({
        where: { id: sectionId },
        data: { order: index + 1, templateId: parsedId },
      })
    )
  )
  await invalidateTemplate(parsedId)
}

export async function moveSection(sectionId: string, direction: 'up' | 'down') {
  const parsedId = idSchema.parse(sectionId)
  const section = await prisma.formSection.findUnique({
    where: { id: parsedId },
    select: {
      id: true,
      templateId: true,
      order: true,
    },
  })

  if (!section) return

  const comparator = direction === 'up' ? 'desc' : 'asc'
  const orderFilter = direction === 'up'
    ? { lt: section.order }
    : { gt: section.order }

  const adjacent = await prisma.formSection.findFirst({
    where: {
      templateId: section.templateId,
      order: orderFilter,
    },
    orderBy: { order: comparator },
  })

  if (!adjacent) return

  await prisma.$transaction([
    prisma.formSection.update({
      where: { id: section.id },
      data: { order: adjacent.order },
    }),
    prisma.formSection.update({
      where: { id: adjacent.id },
      data: { order: section.order },
    }),
  ])

  await invalidateTemplate(section.templateId)
}

export type FieldInput = {
  type: FieldType
  label?: string
}

export type FieldUpdateInput = z.infer<typeof fieldUpdateSchema>
export type TemplateMetadataInput = z.infer<typeof templateMetadataSchema>
export type TemplateMetadataInput = z.infer<typeof templateMetadataSchema>

export async function createField(sectionId: string, input: FieldInput) {
  const parsedSectionId = idSchema.parse(sectionId)

  const section = await prisma.formSection.findUnique({
    where: { id: parsedSectionId },
    include: {
      template: {
        select: {
          id: true,
          sections: {
            include: {
              questions: {
                select: {
                  id: true,
                  fieldCode: true,
                },
              },
            },
          },
        },
      },
      questions: {
        orderBy: { order: 'desc' },
        select: {
          order: true,
        },
      },
    },
  })

  if (!section || !section.template) {
    throw new Error('Section not found')
  }

  const nextOrder = (section.questions[0]?.order ?? 0) + 1
  const allFieldCodes = section.template.sections.flatMap((sec) => sec.questions.map((q) => q.fieldCode))

  const baseCode = `${section.code}.${nextOrder}`
  let uniqueCode = baseCode
  let counter = 1
  while (allFieldCodes.includes(uniqueCode)) {
    uniqueCode = `${baseCode}.${counter}`
    counter += 1
  }

  const fallbackLabel = input.type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  const field = await prisma.formQuestion.create({
    data: {
      sectionId: parsedSectionId,
      type: input.type,
      label: input.label ?? `${fallbackLabel} field`,
      fieldCode: uniqueCode,
      order: nextOrder,
      isRequired: false,
    },
  })

  await invalidateTemplate(section.template.id)
  return field
}

export async function updateField(fieldId: string, input: FieldUpdateInput) {
  const parsedId = idSchema.parse(fieldId)
  const parsedInput = fieldUpdateSchema.parse(input)

  const question = await prisma.formQuestion.findUnique({
    where: { id: parsedId },
    select: {
      id: true,
      type: true,
      section: {
        select: {
          templateId: true,
        },
      },
    },
  })

  if (!question) {
    throw new Error('Field not found')
  }

  const selectionTypes = new Set<FieldType>([
    FieldType.SINGLE_SELECT,
    FieldType.CHECKBOX_GROUP,
    FieldType.MULTI_SELECT,
  ])

  await prisma.$transaction(async (tx) => {
    await tx.formQuestion.update({
      where: { id: parsedId },
      data: {
        label: parsedInput.label,
        helpText: parsedInput.helpText,
        placeholder: parsedInput.placeholder,
        isRequired: parsedInput.isRequired ?? false,
      },
    })

    if (selectionTypes.has(question.type)) {
      await tx.questionOption.deleteMany({ where: { questionId: parsedId } })

      if (parsedInput.options && parsedInput.options.length > 0) {
        await tx.questionOption.createMany({
          data: parsedInput.options.map((option, index) => ({
            questionId: parsedId,
            label: option.label,
            value: option.value,
            order: index + 1,
          })),
        })
      }
    }
  })

  await invalidateTemplate(question.section.templateId)
}

export async function deleteField(fieldId: string) {
  const parsedId = idSchema.parse(fieldId)

  const deleted = await prisma.formQuestion.delete({
    where: { id: parsedId },
    include: {
      section: {
        select: {
          templateId: true,
        },
      },
    },
  })

  await invalidateTemplate(deleted.section.templateId)
}

export async function moveField(fieldId: string, direction: 'up' | 'down') {
  const parsedId = idSchema.parse(fieldId)

  const field = await prisma.formQuestion.findUnique({
    where: { id: parsedId },
    select: {
      id: true,
      order: true,
      sectionId: true,
      section: {
        select: {
          templateId: true,
        },
      },
    },
  })

  if (!field) return

  const comparator = direction === 'up' ? 'desc' : 'asc'
  const orderFilter = direction === 'up' ? { lt: field.order } : { gt: field.order }

  const adjacent = await prisma.formQuestion.findFirst({
    where: {
      sectionId: field.sectionId,
      order: orderFilter,
    },
    orderBy: { order: comparator },
  })

  if (!adjacent) return

  await prisma.$transaction([
    prisma.formQuestion.update({
      where: { id: field.id },
      data: { order: adjacent.order },
    }),
    prisma.formQuestion.update({
      where: { id: adjacent.id },
      data: { order: field.order },
    }),
  ])

  await invalidateTemplate(field.section.templateId)
}

export async function duplicateField(fieldId: string) {
  const parsedId = idSchema.parse(fieldId)

  const question = await prisma.formQuestion.findUnique({
    where: { id: parsedId },
    include: {
      section: {
        include: {
          template: {
            select: {
              id: true,
              sections: {
                include: {
                  questions: {
                    select: {
                      fieldCode: true,
                    },
                  },
                },
              },
            },
          },
          questions: {
            orderBy: { order: 'desc' },
            select: {
              order: true,
            },
          },
        },
      },
      options: {
        orderBy: { order: 'asc' },
      },
      scoringConfig: true,
    },
  })

  if (!question || !question.section.template) {
    throw new Error('Field not found')
  }

  const nextOrder = (question.section.questions[0]?.order ?? 0) + 1
  const allFieldCodes = question.section.template.sections.flatMap((sec) =>
    sec.questions.map((q) => q.fieldCode)
  )

  const baseCode = `${question.section.code}.${nextOrder}`
  let uniqueCode = baseCode
  let counter = 1
  while (allFieldCodes.includes(uniqueCode)) {
    uniqueCode = `${baseCode}.${counter}`
    counter += 1
  }

  const duplicated = await prisma.formQuestion.create({
    data: {
      sectionId: question.sectionId,
      type: question.type,
      label: `${question.label} (Copy)`,
      helpText: question.helpText,
      placeholder: question.placeholder,
      validation: question.validation,
      conditional: question.conditional,
      order: nextOrder,
      fieldCode: uniqueCode,
      isRequired: question.isRequired,
      options: question.options.length
        ? {
            create: question.options.map((option, index) => ({
              label: option.label,
              value: option.value,
              order: index + 1,
            })),
          }
        : undefined,
      scoringConfig: question.scoringConfig
        ? {
            create: {
              minScore: question.scoringConfig.minScore,
              maxScore: question.scoringConfig.maxScore,
              weight: question.scoringConfig.weight,
              criteria: question.scoringConfig.criteria,
            },
          }
        : undefined,
    },
  })

  await invalidateTemplate(question.section.template.id)
  return duplicated
}

export async function saveTemplateAsDraft(templateId: string) {
  const parsedId = idSchema.parse(templateId)

  await prisma.formTemplate.update({
    where: { id: parsedId },
    data: {
      isActive: false,
    },
  })

  await invalidateTemplate(parsedId)
  revalidatePath('/dynamic-form/builder')
}

export async function publishTemplate(templateId: string) {
  const parsedId = idSchema.parse(templateId)

  const template = await prisma.formTemplate.findUnique({
    where: { id: parsedId },
    include: {
      sections: {
        include: {
          questions: true,
        },
      },
    },
  })

  if (!template) {
    throw new Error('Template not found')
  }

  if (template.sections.length === 0) {
    throw new Error('Add at least one section before publishing')
  }

  const hasEmptySection = template.sections.some((section) => section.questions.length === 0)
  if (hasEmptySection) {
    throw new Error('Each section must contain at least one field before publishing')
  }

  await prisma.formTemplate.update({
    where: { id: parsedId },
    data: {
      isActive: true,
    },
  })

  await invalidateTemplate(parsedId)
  revalidatePath('/dynamic-form/builder')
}

export async function updateTemplateMetadata(templateId: string, input: TemplateMetadataInput) {
  const parsedId = idSchema.parse(templateId)
  const parsedInput = templateMetadataSchema.parse(input)

  await prisma.formTemplate.update({
    where: { id: parsedId },
    data: {
      name: parsedInput.name,
      version: parsedInput.version,
      description: parsedInput.description,
    },
  })

  await invalidateTemplate(parsedId)
  revalidatePath('/dynamic-form/builder')
}

export async function createTemplateAction(formData: FormData) {
  const parsed = createTemplateSchema.safeParse({
    name: (formData.get('name') as string | null)?.trim(),
    description: (formData.get('description') as string | null)?.trim() || undefined,
  })

  if (!parsed.success) {
    redirect('/dynamic-form/builder?error=invalid-template-data')
  }

  const { name, description } = parsed.data

  try {
    await prisma.formTemplate.create({
      data: {
        name,
        description,
        version: '1.0',
        isActive: false,
      },
    })

    await revalidatePath('/dynamic-form/builder')
    redirect('/dynamic-form/builder?status=created')
  } catch (error) {
    console.error('Failed to create form template:', error)
    redirect('/dynamic-form/builder?error=create-failed')
  }
}

export async function deleteTemplateAction(formData: FormData) {
  const templateId = formData.get('templateId') as string | null
  const parsed = idSchema.safeParse(templateId?.trim())

  if (!parsed.success) {
    redirect('/dynamic-form/builder?error=missing-template-id')
  }

  try {
    await prisma.formTemplate.delete({
      where: { id: parsed.data },
    })

    await revalidatePath('/dynamic-form/builder')
    redirect('/dynamic-form/builder?status=deleted')
  } catch (error) {
    console.error('Failed to delete form template:', error)
    redirect('/dynamic-form/builder?error=delete-failed')
  }
}

export async function cloneTemplateAction(formData: FormData) {
  const templateId = formData.get('templateId') as string | null
  const parsed = idSchema.safeParse(templateId?.trim())

  if (!parsed.success) {
    redirect('/dynamic-form/builder?error=missing-template-id')
  }

  try {
    const template = await prisma.formTemplate.findUnique({
      where: { id: parsed.data },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                options: true,
                scoringConfig: true,
              },
            },
          },
        },
      },
    })

    if (!template) {
      redirect('/dynamic-form/builder?error=template-not-found')
    }

    const sortedSections = [...template.sections].sort((a, b) => a.order - b.order)

    await prisma.formTemplate.create({
      data: {
        name: `${template.name} (Copy)`,
        description: template.description,
        version: template.version,
        isActive: false,
        sections: {
          create: sortedSections.map((section) => {
            const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order)

            return {
              code: section.code,
              title: section.title,
              description: section.description,
              order: section.order,
              isRequired: section.isRequired,
              questions: {
                create: sortedQuestions.map((question) => {
                  const sortedOptions = [...question.options].sort((a, b) => a.order - b.order)

                  return {
                    fieldCode: question.fieldCode,
                    label: question.label,
                    type: question.type,
                    helpText: question.helpText,
                    placeholder: question.placeholder,
                    validation: question.validation as Prisma.InputJsonValue | undefined,
                    conditional: question.conditional as Prisma.InputJsonValue | undefined,
                    order: question.order,
                    isRequired: question.isRequired,
                    options:
                      sortedOptions.length > 0
                        ? {
                            create: sortedOptions.map((option) => ({
                              value: option.value,
                              label: option.label,
                              order: option.order,
                            })),
                          }
                        : undefined,
                    scoringConfig: question.scoringConfig
                      ? {
                          create: {
                            minScore: question.scoringConfig.minScore,
                            maxScore: question.scoringConfig.maxScore,
                            weight: question.scoringConfig.weight,
                            criteria: question.scoringConfig.criteria as Prisma.InputJsonValue,
                          },
                        }
                      : undefined,
                  }
                }),
              },
            }
          }),
        },
      },
    })

    await revalidatePath('/dynamic-form/builder')
    redirect('/dynamic-form/builder?status=cloned')
  } catch (error) {
    console.error('Failed to clone form template:', error)
    redirect('/dynamic-form/builder?error=clone-failed')
  }
}
