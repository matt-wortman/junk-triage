export interface RowVersionSnapshot {
  technologyRowVersion?: number;
  triageStageRowVersion?: number;
  viabilityStageRowVersion?: number;
}

export interface TechnologyContext {
  id: string;
  techId: string;
  hasTriageStage: boolean;
  hasViabilityStage: boolean;
  technologyRowVersion?: number;
  triageStageRowVersion?: number;
  viabilityStageRowVersion?: number;
}

export class OptimisticLockError extends Error {
  constructor(message = 'Row version mismatch') {
    super(message);
    this.name = 'OptimisticLockError';
  }
}
