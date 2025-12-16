import { AbstractPersistentUnit, PersistentUnitResult } from '@rolster/vinegar';
import { EntityDatabase } from './database';
import { EntityManager } from './entity-manager';
import { AbstractTypeormVinegar, getCurrentVinegar } from './typeorm-manager';
import { TypeormVinegarError } from './types';

export abstract class PersistentUnit extends AbstractPersistentUnit {
  abstract setTypeorm(typeorm: AbstractTypeormVinegar): void;
}

export class TypeormPersistentUnit implements PersistentUnit {
  private vinegar?: AbstractTypeormVinegar;

  constructor(
    private readonly database: EntityDatabase,
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

        const errors = results.filter((result) => !!result.error);

        if (errors.length > 0) {
          throw new TypeormVinegarError('Typeorm Vinegar Transaction', errors);
        }

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
