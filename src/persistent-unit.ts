import { AbstractPersistentUnit, PersistentUnitResult } from '@rolster/vinegar';
import { EntityDatabase } from './database';
import { EntityManager } from './entity-manager';
import { AbstractTypeormVinegar, getCurrentVinegar } from './typeorm-manager';

export abstract class PersistentUnit extends AbstractPersistentUnit {
  abstract setTypeorm(typeorm: AbstractTypeormVinegar): void;
}

export class TypeormPersistentUnit implements PersistentUnit {
  private vinegar?: AbstractTypeormVinegar;

  constructor(
    private database: EntityDatabase,
    public readonly manager: EntityManager
  ) {}

  public setTypeorm(vinegar: AbstractTypeormVinegar): void {
    this.vinegar = vinegar;
  }

  public async flush(): Promise<PersistentUnitResult[]> {
    try {
      const vinegar = this.vinegar ?? getCurrentVinegar();
      const queryRunner = vinegar.createQueryRunner();

      let results: PersistentUnitResult[] = [];

      if (queryRunner) {
        this.database.setQueryRunner(queryRunner);
        this.manager.setQueryRunner(queryRunner);

        await this.database.connect();
        await this.database.transaction();
        results = await this.manager.flush();
        await this.database.commit();
      }

      return results;
    } catch (error) {
      await this.database.rollback();

      throw error;
    } finally {
      await this.database.disconnect();
    }
  }
}
