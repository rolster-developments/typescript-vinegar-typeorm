import { AbstractProcedure, QueryEntityManager } from '@rolster/vinegar';
import { EntityManager } from 'typeorm';

export abstract class TypeormAbstractProcedure extends AbstractProcedure {
  abstract execute(
    queryManager: QueryEntityManager,
    entityManager: EntityManager
  ): Promise<void>;
}
