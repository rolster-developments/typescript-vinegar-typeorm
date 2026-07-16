import {
  AbstractEntityDataSource,
  AbstractProcedure,
  HideableModel,
  Model,
  PersistentUnitResult,
  PersistentUnitResultCode,
  QueryEntityManager,
  RefreshModel
} from '@rolster/vinegar';
import { EntityManager, QueryRunner } from 'typeorm';
import { AbstractModel } from './types';

type Resolver = (entityManager: EntityManager) => Promise<PersistentUnitResult>;

function success(code: PersistentUnitResultCode, model?: AbstractModel) {
  return new PersistentUnitResult(code, undefined, model);
}

function failure(
  code: PersistentUnitResultCode,
  error?: any,
  model?: AbstractModel
) {
  return new PersistentUnitResult(code, error, model);
}

export abstract class EntityDataSource extends AbstractEntityDataSource {
  abstract setQueryRunner(queryRunner: QueryRunner): void;
}

export class TypeormEntityDataSource implements EntityDataSource {
  private queryRunner?: QueryRunner;

  public setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
  }

  public insert(model: Model): Promise<PersistentUnitResult> {
    return this.resolve(async (entityManager) => {
      try {
        await entityManager.save(model);

        return success('insert', model);
      } catch (err) {
        return failure('insert', err, model);
      }
    });
  }

  public update(
    model: Model,
    changes: LiteralObject
  ): Promise<PersistentUnitResult> {
    return this.resolve(async (entityManager) => {
      try {
        await entityManager.update(
          model.constructor,
          { id: model.id },
          changes
        );

        return success('update', model);
      } catch (err) {
        return failure('update', err, model);
      }
    });
  }

  public refresh(refreshs: RefreshModel[]): Promise<PersistentUnitResult> {
    return this.resolve(async (entityManager) => {
      try {
        for (const refresh of refreshs) {
          const changes = refresh.getChanges();

          if (changes) {
            await entityManager.update(
              refresh.model.constructor,
              { id: refresh.model.id },
              changes
            );
          }
        }

        return success('refresh');
      } catch (err) {
        return failure('refresh', err);
      }
    });
  }

  public delete(model: Model): Promise<PersistentUnitResult> {
    return this.resolve(async (entityManager) => {
      try {
        await entityManager.remove(model);

        return success('delete', model);
      } catch (err) {
        return failure('delete', err, model);
      }
    });
  }

  public hidden(model: HideableModel): Promise<PersistentUnitResult> {
    return this.resolve(async (entityManager) => {
      try {
        model.hiddenAt = new Date();
        model.hidden = true;

        await entityManager.update(model.constructor, { id: model.id }, model);

        return success('hidden', model);
      } catch (err) {
        return failure('hidden', err, model);
      }
    });
  }

  public procedure(
    queryManager: QueryEntityManager,
    procedure: AbstractProcedure
  ): Promise<PersistentUnitResult> {
    return this.resolve(async (entityManager) => {
      try {
        await procedure.execute(queryManager, entityManager);

        return success('procedure');
      } catch (err) {
        return failure('procedure', err);
      }
    });
  }

  private resolve(resolver: Resolver): Promise<PersistentUnitResult> {
    if (!this.queryRunner) {
      return Promise.resolve(
        new PersistentUnitResult('operation', new Error('Runner not defined'))
      );
    }

    return resolver(this.queryRunner.manager);
  }
}
