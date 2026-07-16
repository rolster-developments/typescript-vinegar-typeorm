import { DataSource, QueryRunner } from 'typeorm';
import { describe, it, expect, vi } from 'vitest';

import {
  createVinegar,
  setDataSource,
  getDataSource,
  createQueryRunner,
  createRepository
} from './typeorm-manager';

describe('createVinegar', () => {
  it('should create a vinegar instance from DataSource', () => {
    const dataSource = {
      createQueryRunner: vi.fn(),
      getRepository: vi.fn()
    } as unknown as DataSource;

    const vinegar = createVinegar(dataSource);

    expect(vinegar.createQueryRunner).toBeDefined();
    expect(vinegar.createRepository).toBeDefined();
  });
});

describe('setDataSource and getDataSource', () => {
  it('should store and retrieve DataSource', () => {
    const dataSource = {
      createQueryRunner: vi.fn(),
      getRepository: vi.fn()
    } as unknown as DataSource;

    setDataSource(dataSource);

    const result = getDataSource();

    expect(result).toBe(dataSource);
  });
});

describe('createQueryRunner', () => {
  it('should create query runner from stored DataSource', () => {
    const queryRunner = {} as QueryRunner;

    const dataSource = {
      createQueryRunner: vi.fn().mockReturnValue(queryRunner),
      getRepository: vi.fn()
    } as unknown as DataSource;

    setDataSource(dataSource);

    const result = createQueryRunner();

    expect(result).toBe(queryRunner);
  });
});

describe('createRepository', () => {
  it('should create repository from stored DataSource', () => {
    const repository = {} as any;

    const dataSource = {
      createQueryRunner: vi.fn(),
      getRepository: vi.fn().mockReturnValue(repository)
    } as unknown as DataSource;

    setDataSource(dataSource);

    const result = createRepository('User');

    expect(result).toBe(repository);
  });
});
