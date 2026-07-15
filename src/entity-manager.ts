import {
  AbstractEntityManager,
  EntityManager as RolsterEntityManager
} from '@rolster/vinegar';
import { QueryRunner } from 'typeorm';
import { EntityDataSource } from './datasource';

export abstract class EntityManager extends AbstractEntityManager {
  abstract setQueryRunner(queryRunner: QueryRunner): void;
}

export class TypeormEntityManager
  extends RolsterEntityManager<EntityDataSource>
  implements EntityManager
{
  constructor(dataSource: EntityDataSource) {
    super(dataSource);
  }

  public setQueryRunner(queryRunner: QueryRunner): void {
    this.dataSource.setQueryRunner(queryRunner);
  }
}
