import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository
} from 'typeorm';

export interface AbstractTypeormVinegar {
  createQueryRunner(): Undefined<QueryRunner>;
  createRepository<T extends ObjectLiteral>(
    target: EntityTarget<T>
  ): Undefined<Repository<T>>;
}

class TypeormVinegar implements AbstractTypeormVinegar {
  constructor(private dataSource?: DataSource) {}

  public setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
  }

  public getDataSource(): Undefined<DataSource> {
    return this.dataSource;
  }

  public createQueryRunner(): Undefined<QueryRunner> {
    return this.dataSource?.createQueryRunner();
  }

  public createRepository<T extends ObjectLiteral>(
    target: EntityTarget<T>
  ): Undefined<Repository<T>> {
    return this.dataSource?.getRepository<T>(target);
  }
}

const typeormVinegar = new TypeormVinegar();

export function createVinegar(dataSource: DataSource): AbstractTypeormVinegar {
  return new TypeormVinegar(dataSource);
}

export function getCurrentVinegar(): AbstractTypeormVinegar {
  return typeormVinegar;
}

export function setDataSource(dataSource: DataSource): void {
  typeormVinegar.setDataSource(dataSource);
}

export function getDataSource(): Undefined<DataSource> {
  return typeormVinegar.getDataSource();
}

export function createQueryRunner(): Undefined<QueryRunner> {
  return typeormVinegar.createQueryRunner();
}

export function createRepository<T extends ObjectLiteral>(
  target: EntityTarget<T>
): Repository<T> {
  const repository = typeormVinegar.createRepository(target);

  if (!repository) {
    throw Error(
      "Sorry, we can't perform data queries because DataSource is undefined"
    );
  }

  return repository;
}
