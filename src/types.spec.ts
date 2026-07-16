import { describe, it, expect } from 'vitest';

import { PersistentUnitResult } from '@rolster/vinegar';
import { TypeormVinegarError } from './types';

describe('TypeormVinegarError', () => {
  it('should create error with message and errors', () => {
    const errors = [new PersistentUnitResult('insert', null)];

    const error = new TypeormVinegarError('Something failed', errors);

    expect(error.message).toBe('Something failed');
    expect(error.errors).toEqual(errors);
    expect(error).toBeInstanceOf(Error);
  });
});
