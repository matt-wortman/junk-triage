import { prisma } from '@/lib/prisma';
import {
  DataSource,
  FieldType,
  Prisma,
  Technology,
  TriageStage,
  ViabilityStage,
} from '@prisma/client';
import {
  FormTemplateWithSections,
  FormQuestionWithDetails,
} from '@/lib/form-engine/types';
import {
  TECHNOLOGY_BINDABLE_FIELDS,
  REQUIRED_TECH_FIELDS_FOR_CREATE,
  TRIAGE_STAGE_BINDABLE_FIELDS,
  VIABILITY_STAGE_BINDABLE_FIELDS,
} from './constants';
import { RowVersionSnapshot, TechnologyContext, OptimisticLockError } from '@/lib/technology/types';

export interface BindingMetadata {
  fieldCode: string;
  questionId: string;
  dictionaryKey: string;
  bindingPath: string;
  dataSource: DataSource;
}

export interface TemplateHydrationResult {
  template: FormTemplateWithSections;
  bindingMetadata: Record<string, BindingMetadata>;
  initialResponses: Record<string, unknown>;
  initialRepeatGroups: Record<string, Record<string, unknown>[]>;
  technologyContext: TechnologyContext | null;
  rowVersions: RowVersionSnapshot;
}

export type TechnologyWithSupplements = Technology & {
  triageStage: TriageStage | null;
  viabilityStage: ViabilityStage | null;
};

const TEMPLATE_WITH_BINDINGS_INCLUDE = {
  sections: {
    orderBy: { order: 'asc' as const },
    include: {
      questions: {
        orderBy: { order: 'asc' as const },
        include: {
          options: { orderBy: { order: 'asc' as const } },
          scoringConfig: true,
          dictionary: true,
        },
      },
    },
  },
} satisfies Prisma.FormTemplateInclude;

interface LoadTemplateOptions {
  techId?: string;
}

export interface BindingWriteOptions {
  userId?: string;
  allowCreateWhenIncomplete?: boolean;
  expectedVersions?: RowVersionSnapshot;
}

/**
 * Load the active form template along with binding metadata and (optional) prefilled responses.
 */
export async function loadTemplateWithBindings(
  options: LoadTemplateOptions = {}
): Promise<TemplateHydrationResult> {
  const { techId } = options;

  const template = await prisma.formTemplate.findFirst({
    where: { isActive: true },
    include: TEMPLATE_WITH_BINDINGS_INCLUDE,
  });

  if (!template) {
    throw new Error('No active form template found');
  }

  const bindingMetadata = collectBindingMetadata(template);

  if (!techId) {
    return {
      template,
      bindingMetadata,
      initialResponses: {},
      initialRepeatGroups: {},
      technologyContext: null,
      rowVersions: {},
    };
  }

  const technology = await prisma.technology.findUnique({
    where: { techId },
    include: {
      triageStage: true,
      viabilityStage: true,
    },
  });

  if (!technology) {
    return {
      template,
      bindingMetadata,
      initialResponses: {},
      initialRepeatGroups: {},
      technologyContext: null,
      rowVersions: {},
    };
  }

  const { responses: initialResponses, repeatGroups: initialRepeatGroups } = buildInitialValues(
    technology,
    template.sections.flatMap((section) => section.questions)
  );

  return {
    template,
    bindingMetadata,
    initialResponses,
    initialRepeatGroups,
    technologyContext: {
      id: technology.id,
      techId: technology.techId,
      hasTriageStage: Boolean(technology.triageStage),
      hasViabilityStage: Boolean(technology.viabilityStage),
      technologyRowVersion: technology.rowVersion,
      triageStageRowVersion: technology.triageStage?.rowVersion,
      viabilityStageRowVersion: technology.viabilityStage?.rowVersion,
    },
    rowVersions: {
      technologyRowVersion: technology.rowVersion,
      triageStageRowVersion: technology.triageStage?.rowVersion,
      viabilityStageRowVersion: technology.viabilityStage?.rowVersion,
    },
  };
}

export async function fetchTemplateWithBindingsById(templateId: string) {
  const template = await prisma.formTemplate.findUnique({
    where: { id: templateId },
    include: TEMPLATE_WITH_BINDINGS_INCLUDE,
  });

  if (!template) {
    throw new Error(`Form template not found for id ${templateId}`);
  }

  return {
    template,
    bindingMetadata: collectBindingMetadata(template),
  };
}

export function collectBindingMetadata(
  template: FormTemplateWithSections
): Record<string, BindingMetadata> {
  const bindings: Record<string, BindingMetadata> = {};

  for (const section of template.sections) {
    for (const question of section.questions) {
      if (!question.dictionary || !question.dictionaryKey) {
        continue;
      }

      bindings[question.fieldCode] = {
        fieldCode: question.fieldCode,
        questionId: question.id,
        dictionaryKey: question.dictionaryKey,
        bindingPath: question.dictionary.bindingPath,
        dataSource: question.dictionary.dataSource,
      };
    }
  }

  return bindings;
}

function buildInitialValues(
  technology: TechnologyWithSupplements,
  questions: FormQuestionWithDetails[]
): {
  responses: Record<string, unknown>;
  repeatGroups: Record<string, Record<string, unknown>[]>;
} {
  const responses: Record<string, unknown> = {};
  const repeatGroups: Record<string, Record<string, unknown>[]> = {};

  for (const question of questions) {
    if (!question.dictionary) {
      continue;
    }

    const rawValue = resolveBindingValue(question.dictionary.bindingPath, technology);
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const normalized = normalizeValueForField(question, rawValue);
    if (normalized === undefined) {
      continue;
    }

    if (question.type === FieldType.REPEATABLE_GROUP) {
      repeatGroups[question.fieldCode] = normalized as Record<string, unknown>[];
      continue;
    }

    responses[question.fieldCode] = normalized;
  }

  return { responses, repeatGroups };
}

export function resolveBindingValue(
  bindingPath: string,
  technology: TechnologyWithSupplements | null
): unknown {
  if (!technology) {
    return undefined;
  }

  const [root, ...rest] = bindingPath.split('.');
  if (!root || rest.length === 0) {
    return undefined;
  }

  const field = rest.join('.');

  switch (root) {
    case 'technology':
      return (technology as Record<string, unknown>)[field];
    case 'triageStage':
      return technology.triageStage
        ? (technology.triageStage as Record<string, unknown>)[field]
        : undefined;
    case 'viabilityStage':
      return technology.viabilityStage
        ? (technology.viabilityStage as Record<string, unknown>)[field]
        : undefined;
    default:
      return undefined;
  }
}

function normalizeValueForField(
  question: FormQuestionWithDetails,
  value: unknown
): unknown {
  switch (question.type) {
    case FieldType.MULTI_SELECT:
    case FieldType.CHECKBOX_GROUP: {
      if (Array.isArray(value)) {
        return value.map((entry) => String(entry));
      }
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);
      }
      return undefined;
    }

    case FieldType.SCORING_0_3:
    case FieldType.INTEGER: {
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    }

    case FieldType.DATE: {
      if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
      }
      if (typeof value === 'string') {
        return value;
      }
      return undefined;
    }

    case FieldType.REPEATABLE_GROUP: {
      if (Array.isArray(value)) {
        const rows = value
          .map((entry) =>
            entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : null
          )
          .filter((entry): entry is Record<string, unknown> => entry !== null);
        return rows.length > 0 ? rows : undefined;
      }
      return undefined;
    }

    default:
      return value;
  }
}

export async function applyBindingWrites(
  tx: Prisma.TransactionClient,
  bindingMetadata: Record<string, BindingMetadata>,
  responses: Record<string, unknown>,
  options: BindingWriteOptions = {}
): Promise<{ technologyId?: string; techId?: string; rowVersions?: RowVersionSnapshot }> {
  if (!Object.keys(bindingMetadata).length) {
    return {};
  }

  const bindingValues = extractBindingValues(bindingMetadata, responses);
  if (!Object.keys(bindingValues).length) {
    return {};
  }

  const partitions = partitionBindingValues(bindingValues);
  const rawTechId = partitions.technology.techId;
  const resolvedTechId =
    typeof rawTechId === 'string' && rawTechId.trim().length > 0
      ? rawTechId.trim()
      : undefined;

  if (!resolvedTechId) {
    return {};
  }

  const expected = options.expectedVersions ?? {};

  let technologyRecord = await tx.technology.findUnique({
    where: { techId: resolvedTechId },
    include: {
      triageStage: true,
      viabilityStage: true,
    },
  });

  const technologyData = sanitizeTechnologyData(
    partitions.technology,
    resolvedTechId,
    options.userId
  );

  let technologyRowVersion = technologyRecord?.rowVersion;

  if (technologyRecord) {
    if (Object.keys(technologyData).length > 0) {
      if (expected.technologyRowVersion !== undefined) {
        const result = await tx.technology.updateMany({
          where: {
            id: technologyRecord.id,
            rowVersion: expected.technologyRowVersion,
          },
          data: {
            ...technologyData,
            rowVersion: { increment: 1 },
          },
        });

        if (result.count === 0) {
          throw new OptimisticLockError('Technology record was modified by another user.');
        }
      } else {
        await tx.technology.update({
          where: { id: technologyRecord.id },
          data: {
            ...technologyData,
            rowVersion: { increment: 1 },
          },
        });
      }

      technologyRecord = await tx.technology.findUnique({
        where: { id: technologyRecord.id },
        include: {
          triageStage: true,
          viabilityStage: true,
        },
      });

      if (!technologyRecord) {
        throw new Error('Unable to reload technology record after update.');
      }

      technologyRowVersion = technologyRecord.rowVersion;
    }
  } else {
    const missingFields = getMissingRequiredTechnologyFields(technologyData);
    if (missingFields.length > 0) {
      if (options.allowCreateWhenIncomplete) {
        throw new Error(
          `Missing required technology fields: ${missingFields.join(', ')}`
        );
      }
      return {};
    }

    technologyRecord = await tx.technology.create({
      data: technologyData as Prisma.TechnologyCreateInput,
      include: {
        triageStage: true,
        viabilityStage: true,
      },
    });

    technologyRowVersion = technologyRecord.rowVersion;
  }

  if (!technologyRecord) {
    return {};
  }

  const triageStageRowVersion = await upsertTriageStage(
    tx,
    technologyRecord.id,
    technologyRecord.triageStage,
    partitions.triageStage,
    expected.triageStageRowVersion
  );

  const viabilityStageRowVersion = await upsertViabilityStage(
    tx,
    technologyRecord.id,
    technologyRecord.viabilityStage,
    partitions.viabilityStage,
    expected.viabilityStageRowVersion
  );

  return {
    technologyId: technologyRecord.id,
    techId: resolvedTechId,
    rowVersions: {
      technologyRowVersion,
      triageStageRowVersion,
      viabilityStageRowVersion,
    },
  };
}

function extractBindingValues(
  bindingMetadata: Record<string, BindingMetadata>,
  responses: Record<string, unknown>
) {
  const values: Record<string, unknown> = {};

  for (const meta of Object.values(bindingMetadata)) {
    if (Object.prototype.hasOwnProperty.call(responses, meta.fieldCode)) {
      values[meta.bindingPath] = responses[meta.fieldCode];
    }
  }

  return values;
}

function partitionBindingValues(values: Record<string, unknown>) {
  const partitions: Record<
    'technology' | 'triageStage' | 'viabilityStage',
    Record<string, unknown>
  > = {
    technology: {},
    triageStage: {},
    viabilityStage: {},
  };

  for (const [bindingPath, value] of Object.entries(values)) {
    const [root, ...rest] = bindingPath.split('.');
    if (!root || rest.length === 0) {
      continue;
    }

    const field = rest.join('.');

    if (root === 'technology') {
      partitions.technology[field] = value;
    } else if (root === 'triageStage') {
      partitions.triageStage[field] = value;
    } else if (root === 'viabilityStage') {
      partitions.viabilityStage[field] = value;
    }
  }

  return partitions;
}

function sanitizeTechnologyData(
  raw: Record<string, unknown>,
  techId: string,
  userId?: string
): Partial<Technology> {
  const data: Partial<Technology> = {
    techId,
  };
  const target = data as Record<string, unknown>;

  const inventorRows = Array.isArray(raw.inventorName)
    ? (raw.inventorName as Record<string, unknown>[])
    : null;

  if (inventorRows) {
    const { summary, departments, titles } = summarizeInventorRows(inventorRows);
    if (summary) {
      target.inventorName = summary;
    }
    if (departments) {
      target.inventorDept = departments;
    }
    if (titles) {
      target.inventorTitle = titles;
    }
  }

  for (const [field, value] of Object.entries(raw)) {
    if (field === 'techId') {
      continue;
    }

    if (!TECHNOLOGY_BINDABLE_FIELDS.has(field as keyof Technology)) {
      continue;
    }

    if (field === 'inventorName' && inventorRows) {
      // Already handled above to preserve formatting / derived fields.
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      const flattened = flattenArrayValue(value);
      if (flattened) {
        target[field] = flattened;
      }
      continue;
    }

    target[field] = typeof value === 'string' ? value.trim() : value;
  }

  if (userId) {
    data.lastModifiedBy = userId;
  }
  data.lastModifiedAt = new Date();

  return data;
}

function summarizeInventorRows(rows: Record<string, unknown>[]): {
  summary?: string;
  departments?: string;
  titles?: string;
} {
  if (!rows.length) {
    return {};
  }

  const summaryLines: string[] = [];
  const departmentSet = new Set<string>();
  const titleSet = new Set<string>();

  rows.forEach((row) => {
    const name = extractFirstString(row, ['name', 'inventorName', 'value']);
    const title = extractFirstString(row, ['title', 'inventorTitle']);
    const department = extractFirstString(row, ['department', 'dept', 'departmentName']);
    const email = extractFirstString(row, ['email', 'contact']);

    if (name) {
      const parts = [name];
      if (title) {
        parts.push(title);
        titleSet.add(title);
      }
      if (department) {
        parts.push(department);
        departmentSet.add(department);
      }
      if (email) {
        parts.push(email);
      }
      summaryLines.push(parts.join(' | '));
    }
  });

  return {
    summary: summaryLines.length > 0 ? summaryLines.join('\n') : undefined,
    departments: departmentSet.size > 0 ? Array.from(departmentSet).join('; ') : undefined,
    titles: titleSet.size > 0 ? Array.from(titleSet).join('; ') : undefined,
  };
}

function extractFirstString(
  row: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function flattenArrayValue(value: unknown[]): string | undefined {
  const parts = value
    .map((item) => {
      if (item === null || item === undefined) {
        return null;
      }
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (typeof item === 'number' || typeof item === 'boolean') {
        return String(item);
      }
      if (typeof item === 'object') {
        try {
          return JSON.stringify(item);
        } catch {
          return null;
        }
      }
      return null;
    })
    .filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join('; ') : undefined;
}

function getMissingRequiredTechnologyFields(
  data: Partial<Technology>
) {
  return REQUIRED_TECH_FIELDS_FOR_CREATE.filter((field) => {
    const value = data[field];
    if (value === undefined || value === null) {
      return true;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return true;
    }

    return false;
  });
}

async function upsertTriageStage(
  tx: Prisma.TransactionClient,
  technologyId: string,
  existingStage: TriageStage | null,
  raw: Record<string, unknown>,
  expectedRowVersion?: number
): Promise<number | undefined> {
  const data = sanitizeTriageStageData(raw);
  if (!Object.keys(data).length) {
    return existingStage?.rowVersion;
  }

  if (existingStage) {
    if (expectedRowVersion !== undefined) {
      const result = await tx.triageStage.updateMany({
        where: { id: existingStage.id, rowVersion: expectedRowVersion },
        data: {
          ...data,
          rowVersion: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new OptimisticLockError('Triage stage was modified by another user.');
      }
    } else {
      await tx.triageStage.update({
        where: { id: existingStage.id },
        data: {
          ...data,
          rowVersion: { increment: 1 },
        },
      });
    }

    const updated = await tx.triageStage.findUnique({ where: { id: existingStage.id } });
    return updated?.rowVersion;
  }

  const created = await tx.triageStage.create({
    data: buildTriageStageCreateData(technologyId, data),
  });
  return created.rowVersion;
}

async function upsertViabilityStage(
  tx: Prisma.TransactionClient,
  technologyId: string,
  existingStage: ViabilityStage | null,
  raw: Record<string, unknown>,
  expectedRowVersion?: number
): Promise<number | undefined> {
  const data = sanitizeViabilityStageData(raw);
  if (!Object.keys(data).length) {
    return existingStage?.rowVersion;
  }

  if (existingStage) {
    if (expectedRowVersion !== undefined) {
      const result = await tx.viabilityStage.updateMany({
        where: { id: existingStage.id, rowVersion: expectedRowVersion },
        data: {
          ...data,
          rowVersion: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new OptimisticLockError('Viability stage was modified by another user.');
      }
    } else {
      await tx.viabilityStage.update({
        where: { id: existingStage.id },
        data: {
          ...data,
          rowVersion: { increment: 1 },
        },
      });
    }

    const updated = await tx.viabilityStage.findUnique({ where: { id: existingStage.id } });
    return updated?.rowVersion;
  }

  const created = await tx.viabilityStage.create({
    data: buildViabilityStageCreateData(technologyId, data),
  });
  return created.rowVersion;
}

function sanitizeTriageStageData(
  raw: Record<string, unknown>
): Partial<TriageStage> {
  const data: Partial<TriageStage> = {};

  for (const [field, value] of Object.entries(raw)) {
    if (!TRIAGE_STAGE_BINDABLE_FIELDS.has(field as keyof TriageStage)) {
      continue;
    }

    switch (field) {
      case 'technologyOverview': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.technologyOverview = str;
        }
        break;
      }
      case 'missionAlignmentText': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.missionAlignmentText = str;
        }
        break;
      }
      case 'missionAlignmentScore': {
        const num = coerceNumber(value);
        if (num !== undefined) {
          data.missionAlignmentScore = num;
        }
        break;
      }
      case 'unmetNeedText': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.unmetNeedText = str;
        }
        break;
      }
      case 'unmetNeedScore': {
        const num = coerceNumber(value);
        if (num !== undefined) {
          data.unmetNeedScore = num;
        }
        break;
      }
      case 'stateOfArtText': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.stateOfArtText = str;
        }
        break;
      }
      case 'stateOfArtScore': {
        const num = coerceNumber(value);
        if (num !== undefined) {
          data.stateOfArtScore = num;
        }
        break;
      }
      case 'marketOverview': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.marketOverview = str;
        }
        break;
      }
      case 'marketScore': {
        const num = coerceNumber(value);
        if (num !== undefined) {
          data.marketScore = num;
        }
        break;
      }
      case 'recommendation': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.recommendation = str;
        }
        break;
      }
      case 'recommendationNotes': {
        const str = coerceString(value);
        if (str !== undefined) {
          data.recommendationNotes = str;
        }
        break;
      }
      default: {
        const str = coerceString(value);
        if (str !== undefined) {
          (data as Record<string, unknown>)[field] = str;
        }
      }
    }
  }

  return data;
}

function sanitizeViabilityStageData(
  raw: Record<string, unknown>
): Partial<ViabilityStage> {
  const data: Partial<ViabilityStage> = {};

  for (const [field, value] of Object.entries(raw)) {
    if (!VIABILITY_STAGE_BINDABLE_FIELDS.has(field as keyof ViabilityStage)) {
      continue;
    }

    if (field === 'technicalFeasibility') {
      const str = coerceString(value);
      if (str !== undefined) {
        data.technicalFeasibility = str;
      }
    }
  }

  return data;
}

function buildTriageStageCreateData(
  technologyId: string,
  data: Partial<TriageStage>
): Prisma.TriageStageCreateInput {
  return {
    technology: {
      connect: { id: technologyId },
    },
    technologyOverview: data.technologyOverview ?? '',
    missionAlignmentText: data.missionAlignmentText ?? '',
    missionAlignmentScore: data.missionAlignmentScore ?? 0,
    unmetNeedText: data.unmetNeedText ?? '',
    unmetNeedScore: data.unmetNeedScore ?? 0,
    stateOfArtText: data.stateOfArtText ?? '',
    stateOfArtScore: data.stateOfArtScore ?? 0,
    marketOverview: data.marketOverview ?? '',
    marketScore: data.marketScore ?? 0,
    impactScore: data.impactScore ?? 0,
    valueScore: data.valueScore ?? 0,
    recommendation: data.recommendation ?? '',
    recommendationNotes: data.recommendationNotes ?? undefined,
  };
}

function buildViabilityStageCreateData(
  technologyId: string,
  data: Partial<ViabilityStage>
): Prisma.ViabilityStageCreateInput {
  return {
    technology: {
      connect: { id: technologyId },
    },
    technicalFeasibility: data.technicalFeasibility ?? '',
    regulatoryPathway: '',
    costAnalysis: '',
    resourceRequirements: '',
    riskAssessment: '',
    overallViability: '',
    technicalScore: data.technicalScore ?? 0,
    commercialScore: data.commercialScore ?? 0,
  };
}

function coerceString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function coerceNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(num)) {
    return Math.round(num);
  }

  return undefined;
}
