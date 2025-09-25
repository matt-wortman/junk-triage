import { ConditionalConfig, ConditionalRule } from './types';

export type JsonRecord = Record<string, unknown>;

const allowedOperators: ConditionalRule['operator'][] = [
  'equals',
  'not_equals',
  'contains',
  'greater_than',
  'less_than',
  'exists',
  'not_exists',
  'not_empty',
];

const allowedActions: ConditionalRule['action'][] = ['show', 'hide', 'require', 'optional'];

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseJsonRecord(value: unknown): JsonRecord | null {
  if (isJsonRecord(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return isJsonRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

export function parseValidationMetadata(value: unknown): JsonRecord | null {
  return parseJsonRecord(value);
}

export function isInfoBoxMetadata(metadata: JsonRecord | null): boolean {
  return Boolean(metadata?.isInfoBox === true);
}

export function getInfoBoxStyle(metadata: JsonRecord | null, fallback: string = 'blue'): string {
  const style = metadata?.infoBoxStyle;
  return typeof style === 'string' ? style : fallback;
}

type LegacyCondition = {
  field?: unknown;
  operator?: unknown;
  value?: unknown;
};

type LegacyConditionalConfig = {
  showIf: LegacyCondition[];
};

type ConditionalConfigShape = {
  rules: unknown[];
  logic?: unknown;
};

export function parseConditionalConfigValue(value: unknown): ConditionalConfig | null {
  const rawConfig = parseJsonRecord(value);
  if (!rawConfig) {
    return null;
  }

  if (isLegacyConditionalConfig(rawConfig)) {
    const rules = rawConfig.showIf
      .map(convertLegacyCondition)
      .filter((rule): rule is ConditionalRule => rule !== null);

    if (!rules.length) {
      return null;
    }

    return {
      rules,
      logic: 'OR',
    };
  }

  if (isConditionalConfigShape(rawConfig)) {
    const rules = rawConfig.rules
      .map(normalizeConditionalRule)
      .filter((rule): rule is ConditionalRule => rule !== null);

    if (!rules.length) {
      return null;
    }

    const logic = rawConfig.logic === 'OR' ? 'OR' : 'AND';

    return {
      rules,
      logic,
    };
  }

  return null;
}

function isLegacyConditionalConfig(value: JsonRecord): value is LegacyConditionalConfig {
  return Array.isArray(value.showIf);
}

function convertLegacyCondition(condition: LegacyCondition): ConditionalRule | null {
  if (typeof condition.field !== 'string') {
    return null;
  }

  if (!isValidOperator(condition.operator)) {
    return null;
  }

  const conditionalValue = toConditionalValue(condition.value);
  if (conditionalValue === undefined) {
    return null;
  }

  return {
    field: condition.field,
    operator: condition.operator,
    value: conditionalValue,
    action: 'show',
  };
}

function isConditionalConfigShape(value: JsonRecord): value is ConditionalConfigShape {
  return Array.isArray(value.rules);
}

function normalizeConditionalRule(rule: unknown): ConditionalRule | null {
  const record = parseJsonRecord(rule);
  if (!record) {
    return null;
  }

  const { field, operator, action, value } = record;

  if (typeof field !== 'string') {
    return null;
  }

  if (!isValidOperator(operator) || !isValidAction(action)) {
    return null;
  }

  const conditionalValue = toConditionalValue(value);
  if (conditionalValue === undefined) {
    return null;
  }

  return {
    field,
    operator,
    value: conditionalValue,
    action,
  };
}

function isValidOperator(value: unknown): value is ConditionalRule['operator'] {
  return typeof value === 'string' && (allowedOperators as string[]).includes(value);
}

function isValidAction(value: unknown): value is ConditionalRule['action'] {
  return typeof value === 'string' && (allowedActions as string[]).includes(value);
}

function toConditionalValue(value: unknown): ConditionalRule['value'] | undefined {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value;
  }

  return undefined;
}
