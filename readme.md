# Rolster Vinegar Typeorm

Package containing clean architecture implementations with Typeorm.

## Installation

```
npm i @rolster/vinegar-typeorm
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Overview

This package implements the [`@rolster/vinegar`](https://www.npmjs.com/package/@rolster/vinegar)
abstractions on top of [TypeORM](https://typeorm.io). It gives you a global
data-source registry, transaction helpers, and concrete `Database` /
`Datasource` / `EntityManager` / `PersistentUnit` classes wired to a TypeORM
`QueryRunner`.

## Setup

Initialize your TypeORM `DataSource` once and register it globally with
`setDataSource`. The helper functions resolve their `QueryRunner` and
repositories from that registry.

```typescript
import { DataSource } from 'typeorm';
import { setDataSource } from '@rolster/vinegar-typeorm';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'rolster',
  entities: [UserModel, OrderModel],
  synchronize: false
});

await dataSource.initialize();

setDataSource(dataSource); // register globally
```

Registry helpers:

| Function                     | Returns / does                                         |
| ---------------------------- | ------------------------------------------------------ |
| `setDataSource(dataSource)`  | Registers the global data source.                      |
| `getDataSource()`            | Returns the registered `DataSource`.                   |
| `createVinegar(dataSource)`  | Builds a standalone vinegar instance (no global state).|
| `createQueryRunner()`        | A new TypeORM `QueryRunner` from the registry.         |
| `createRepository(target)`   | A TypeORM `Repository<T>` for an entity.               |

## Transactions

The `transaction` helper runs a callback inside a `connect → startTransaction →
commit` block, rolling back automatically on error and always releasing the
`QueryRunner`.

```typescript
import { transaction, createRepository } from '@rolster/vinegar-typeorm';

const order = await transaction(async () => {
  const orders = createRepository(OrderModel);
  const users = createRepository(UserModel);

  const user = await users.findOneByOrFail({ id: 1 });
  return orders.save({ user, total: 9900 });
});
// committed if the callback resolves, rolled back if it throws
```

You can also pass an explicit vinegar instance as the first argument:

```typescript
import { createVinegar, transaction } from '@rolster/vinegar-typeorm';

const vinegar = createVinegar(dataSource);
await transaction(vinegar, async () => { /* ... */ });
```

## Unit of Work

For the full vinegar flow, compose `TypeormEntityDatabase`,
`TypeormEntityDataSource`, `TypeormEntityManager` and `TypeormPersistentUnit`.
Queue operations on the manager, then `flush()` the persistent unit — everything
runs in a single transaction and returns a `PersistentUnitResult[]`.

```typescript
import {
  TypeormEntityDatabase,
  TypeormEntityDataSource,
  TypeormEntityManager,
  TypeormPersistentUnit
} from '@rolster/vinegar-typeorm';

const database = new TypeormEntityDatabase();
const datasource = new TypeormEntityDataSource();
const manager = new TypeormEntityManager(datasource);
const unit = new TypeormPersistentUnit(database, manager);

// Queue domain operations (EntityPersist / EntitySync / ... from @rolster/vinegar)
manager.persist(new CreateUserPersist(userEntity));
manager.sync(new UpdateUserSync(userEntity, userModel));

const results = await unit.flush();
// If any operation fails, the transaction is rolled back and a
// TypeormVinegarError (carrying every failed PersistentUnitResult) is thrown.
```

`TypeormPersistentUnit.flush()` resolves the `QueryRunner` from the global
registry; call `unit.setTypeorm(createVinegar(dataSource))` to use a specific
data source instead.

## Custom procedures

Extend `TypeormAbstractProcedure` to run arbitrary TypeORM queries within the
unit of work. `execute` receives the vinegar query manager and TypeORM's own
`EntityManager`:

```typescript
import { TypeormAbstractProcedure } from '@rolster/vinegar-typeorm';

class TouchUsersProcedure extends TypeormAbstractProcedure {
  constructor(private ids: number[]) {
    super();
  }

  public async execute(_query: QueryEntityManager, em: EntityManager): Promise<void> {
    await em
      .createQueryBuilder()
      .update(UserModel)
      .set({ updatedAt: new Date() })
      .where('id IN (:...ids)', { ids: this.ids })
      .execute();
  }
}

manager.procedure(new TouchUsersProcedure([1, 2, 3]));
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
