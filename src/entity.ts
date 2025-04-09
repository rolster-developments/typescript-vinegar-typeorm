import {
  AbstractEntity,
  AbstractModel,
  EntityRefresh as VinegarEntityRefresh
} from '@rolster/vinegar';
import { Repository } from 'typeorm';
import { Transaction } from './types';

export abstract class EntityRefresh<
    E extends AbstractEntity,
    M extends AbstractModel
  >
  extends VinegarEntityRefresh<E, M>
  implements Transaction<M>
{
  constructor(
    entity: E,
    model: M,
    private repository: Repository<M>,
    relationable = true
  ) {
    super(entity, model, relationable);
  }

  public async execute(): Promise<void> {
    this.refresh();

    await this.repository.save(this.model);
  }
}
