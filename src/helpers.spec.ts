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
});
