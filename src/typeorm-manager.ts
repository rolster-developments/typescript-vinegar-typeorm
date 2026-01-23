import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository
} from 'typeorm';

export interface AbstractTypeormVinegar {
  createQueryRunner(): QueryRunner;
  createRepository<T extends ObjectLiteral>(
    target: EntityTarget<T>
  ): Repository<T>;
}

class TypeormVinegar implements AbstractTypeormVinegar {
  constructor(private readonly dataSource: DataSource) {}

  public getDataSource(): DataSource {
    return this.dataSource;
  }

  public createQueryRunner(): QueryRunner {
    return this.dataSource.createQueryRunner();
  }

  public createRepository<T extends ObjectLiteral>(
    target: EntityTarget<T>
  ): Repository<T> {
    return this.dataSource.getRepository<T>(target);
  }
}

let _typeormVinegar: TypeormVinegar | undefined = undefined;

export function createVinegar(dataSource: DataSource): AbstractTypeormVinegar {
  return new TypeormVinegar(dataSource);
}

export function getTypeormVinegar(): AbstractTypeormVinegar {
  if (!_typeormVinegar) {
    throw Error(
      "Sorry, we can't perform data queries because DataSource is undefined"
    );
  }

  return _typeormVinegar;
}

export function setDataSource(dataSource: DataSource): void {
  _typeormVinegar = new TypeormVinegar(dataSource);
}

export function getDataSource(): DataSource {
  const dataSource = _typeormVinegar?.getDataSource();

  if (!dataSource) {
    throw Error(
      "Sorry, we can't perform data queries because DataSource is undefined"
    );
  }

  return dataSource;
}

export function createQueryRunner(): QueryRunner {
  const queryRunner = _typeormVinegar?.createQueryRunner();

  if (!queryRunner) {
    throw Error(
      "Sorry, we can't perform data queries because DataSource is undefined"
    );
  }

  return queryRunner;
}

export function createRepository<T extends ObjectLiteral>(
  target: EntityTarget<T>
): Repository<T> {
  const repository = _typeormVinegar?.createRepository(target);

  if (!repository) {
    throw Error(
      "Sorry, we can't perform data queries because DataSource is undefined"
    );
  }

  return repository;
}
