import { AbstractTypeormVinegar, getTypeormVinegar } from './typeorm-manager';

type Callback<T> = () => Promise<T | void>;
type Result<T> = Promise<T | void>;

async function resolveTransaction<T = any>(
  vinegar: AbstractTypeormVinegar,
  callback: Callback<T>
): Result<T> {
  const queryRunner = vinegar.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result = await callback();

    await queryRunner.commitTransaction();

    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();

    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function transaction<T = any>(callback: Callback<T>): Result<T>;
export async function transaction<T = any>(
  vinegar: AbstractTypeormVinegar,
  callback: Callback<T>
): Result<T>;
export async function transaction<T = any>(
  vinegar: AbstractTypeormVinegar | Callback<T>,
  callback?: Callback<T>
): Result<T> {
  if (typeof vinegar === 'function') {
    return resolveTransaction(getTypeormVinegar(), vinegar);
  }

  if (callback) {
    return resolveTransaction(vinegar, callback);
  }

  throw Error('Sorry, we were unable to resolve the database transaction');
}
