export class OptimisticLockError extends Error {
  constructor(message = 'Row version mismatch') {
    super(message);
    this.name = 'OptimisticLockError';
  }
}

