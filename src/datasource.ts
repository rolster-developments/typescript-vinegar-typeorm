import {
  AbstractEntityDataSource,
  AbstractProcedure,
  DirtyModel,
  Model,
  ModelHideable,
  PersistentUnitResultCode,
  PersistentUnitResult as Result,
  Transaction
} from '@rolster/vinegar';
import { EntityManager, QueryRunner } from 'typeorm';

type Resolver = (entityManager: EntityManager) => Promise<Result>;

function success(code: PersistentUnitResultCode, model?: Model) {
  return new Result(code, undefined, model);
}

function failure(code: PersistentUnitResultCode, error?: any, model?: Model) {
  return new Result(code, error, model);
}

export abstract class EntityDataSource extends AbstractEntityDataSource {
  abstract setQueryRunner(queryRunner: QueryRunner): void;
}

export class TypeormEntityDataSource implements EntityDataSource {
  private queryRunner?: QueryRunner;

  public setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
  }

  public insert(model: Model): Promise<Result> {
    return this.resolver((manager) =>
      manager
        .save(model)
        .then(() => {
          return success('insert', model);
        })
        .catch((err) => {
          return failure('insert', err, model);
        })
    );
  }

  public refresh(transaction: Transaction): Promise<Result> {
    return this.resolver((_) =>
      transaction
        .execute()
        .then(() => {
          return success('refresh');
        })
        .catch((err) => {
          return failure('refresh', err);
        })
    );
  }

  public update(model: Model, dirty: DirtyModel): Promise<Result> {
    return this.resolver((manager) =>
      manager
        .update(model.constructor, { id: model.id }, dirty)
        .then(() => {
          return success('update', model);
        })
        .catch((err) => {
          return failure('update', err, model);
        })
    );
  }

  public delete(model: Model): Promise<Result> {
    return this.resolver((manager) =>
      manager
        .remove(model)
        .then(() => {
          return success('delete', model);
        })
        .catch((err) => {
          return failure('delete', err, model);
        })
    );
  }

  public hidden(model: ModelHideable): Promise<Result> {
    return this.resolver((manager) => {
      model.hiddenAt = new Date();
      model.hidden = true;

      return manager
        .update(model.constructor, { id: model.id }, model)
        .then(() => {
          return success('hidden', model);
        })
        .catch((err) => {
          return failure('hidden', err, model);
        });
    });
  }

  public procedure(procedure: AbstractProcedure): Promise<Result> {
    return this.resolver((manager) =>
      procedure
        .execute(manager)
        .then(() => {
          return success('procedure');
        })
        .catch((err) => {
          return failure('procedure', err);
        })
    );
  }

  private resolver(resolve: Resolver): Promise<Result> {
    return !this.queryRunner
      ? Promise.resolve(
          new Result('operation', new Error('Runner not defined'))
        )
      : resolve(this.queryRunner.manager);
  }
}
