import {
  AbstractModel as RolsterAbstractModel,
  EditableModel as RolsterEditableModel,
  HideableModel as RolsterHideableModel,
  Model as RolsterModel,
  PersistentUnitResult,
  Transaction as RolsterTransaction
} from '@rolster/vinegar';

import { ObjectLiteral } from 'typeorm';

export interface AbstractModel extends ObjectLiteral, RolsterAbstractModel {}

export interface EditableModel extends ObjectLiteral, RolsterEditableModel {}

export interface HideableModel extends ObjectLiteral, RolsterHideableModel {}

export interface Model extends ObjectLiteral, RolsterModel {}

export interface Transaction<M extends AbstractModel = AbstractModel>
  extends RolsterTransaction {
  model: M;
}

export class TypeormVinegarError extends Error {
  constructor(
    message: string,
    public readonly errors: PersistentUnitResult[]
  ) {
    super(message);
  }
}
