import { AbstractEntityDatabase } from '@rolster/vinegar';

import { QueryRunner } from 'typeorm';

export abstract class EntityDatabase extends AbstractEntityDatabase {
  abstract setQueryRunner(queryRunner: QueryRunner): void;
}

export class TypeormEntityDatabase implements EntityDatabase {
  private queryRunner?: QueryRunner;

  public setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
  }

  public async connect(): Promise<void> {
    await this.queryRunner?.connect();
  }

  public async disconnect(_?: boolean): Promise<void> {
    await this.queryRunner?.release();
  }

  public async transaction(): Promise<void> {
    await this.queryRunner?.startTransaction();
  }

  public async commit(): Promise<void> {
    await this.queryRunner?.commitTransaction();
  }

  public async rollback(): Promise<void> {
    await this.queryRunner?.rollbackTransaction();
  }
}
