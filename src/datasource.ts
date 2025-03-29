import { voidPromise } from '@rolster/commons';
import {
  AbstractEntityDataSource,
  AbstractProcedure,
  DirtyModel,
  Model,
  ModelHideable,
  Transaction
} from '@rolster/vinegar';
import { EntityManager, QueryRunner } from 'typeorm';

type Resolver = (entityManager: EntityManager) => Promise<void>;

export abstract class EntityDataSource extends AbstractEntityDataSource {
  abstract setQueryRunner(queryRunner: QueryRunner): void;
}

export class TypeormEntityDataSource implements EntityDataSource {
  private queryRunner?: QueryRunner;

  public setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
  }

  public insert(model: Model): Promise<void> {
    return this.resolver((manager) => voidPromise(manager.save(model)));
  }

  public refresh(transaction: Transaction): Promise<void> {
    return this.resolver((_) => transaction.execute());
  }

  public update(model: Model, dirty: DirtyModel): Promise<void> {
    return this.resolver((manager) =>
      voidPromise(manager.update(model.constructor, { id: model.id }, dirty))
    );
  }

  public delete(model: Model): Promise<void> {
    return this.resolver((manager) => voidPromise(manager.remove(model)));
  }

  public hidden(model: ModelHideable): Promise<void> {
    return this.resolver((manager) => {
      model.hiddenAt = new Date();
      model.hidden = true;

      return voidPromise(
        manager.update(model.constructor, { id: model.id }, model)
      );
    });
  }

  public procedure(procedure: AbstractProcedure): Promise<void> {
    return this.resolver((manager) => procedure.execute(manager));
  }

  private async resolver(resolve: Resolver): Promise<void> {
    return this.queryRunner && resolve(this.queryRunner.manager);
  }
}
