import { describe, it, expect, vi } from 'vitest';

import { transaction } from './transaction';
import { setDataSource } from './typeorm-manager';

describe('transaction', () => {
  it('should execute callback within transaction', async () => {
    const queryRunner = {
      connect: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      manager: {}
    };

    const dataSource = {
      createQueryRunner: vi.fn().mockReturnValue(queryRunner),
      getRepository: vi.fn()
    } as any;

    setDataSource(dataSource);

    const callback = vi.fn().mockResolvedValue('result');

    const result = await transaction(callback);

    expect(result).toBe('result');
    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should rollback on error', async () => {
    const queryRunner = {
      connect: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      manager: {}
    };

    const dataSource = {
      createQueryRunner: vi.fn().mockReturnValue(queryRunner),
      getRepository: vi.fn()
    } as any;

    setDataSource(dataSource);

    const callback = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(transaction(callback)).rejects.toThrow('fail');
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });
});
