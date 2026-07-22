import { normalize } from './helpers';

describe('normalize', () => {
  it('should remove keys with undefined values', () => {
    expect(normalize({ id: 1, name: undefined })).toEqual({ id: 1 });
  });

  it('should keep keys with null values', () => {
    expect(normalize({ id: 1, deletedAt: null })).toEqual({
      id: 1,
      deletedAt: null
    });
  });

  it('should keep defined falsy values', () => {
    expect(normalize({ count: 0, label: '', active: false })).toEqual({
      count: 0,
      label: '',
      active: false
    });
  });

  it('should remove undefined keys inside nested objects', () => {
    expect(normalize({ user: { id: 1, alias: undefined } })).toEqual({
      user: { id: 1 }
    });
  });

  it('should keep Date instances as leaf values', () => {
    const updatedAt = new Date('2026-07-22T00:00:00.000Z');

    const result = normalize({ updatedAt });

    expect(result.updatedAt).toBe(updatedAt);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should keep native instances inside nested objects', () => {
    const lastConnection = new Date('2026-07-22T00:00:00.000Z');

    const result = normalize({ session: { lastConnection, alias: undefined } });

    expect(result.session).toEqual({ lastConnection });
    expect(result.session.lastConnection).toBeInstanceOf(Date);
  });

  it('should keep RegExp instances as leaf values', () => {
    const pattern = /rolster/i;

    const result = normalize({ pattern });

    expect(result.pattern).toBe(pattern);
    expect(result.pattern).toBeInstanceOf(RegExp);
  });

  it('should keep Map instances as leaf values', () => {
    const metadata = new Map([['role', 'admin']]);

    const result = normalize({ metadata });

    expect(result.metadata).toBe(metadata);
    expect(result.metadata).toBeInstanceOf(Map);
  });

  it('should keep class instances as leaf values', () => {
    class Money {
      constructor(public amount: number) {}
    }

    const price = new Money(1000);

    const result = normalize({ price });

    expect(result.price).toBe(price);
    expect(result.price).toBeInstanceOf(Money);
  });
});
