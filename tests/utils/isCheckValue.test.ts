import { isObject, isString } from '../../src/utils/isCheckValue';

describe('isObject', () => {
  test('Returns true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
  });
  test('Returns false for non-objects', () => {
    expect(isObject('')).toBe(false);
    expect(isObject(0)).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(() => undefined)).toBe(false);
  });
});

describe('isString', () => {
  test('Returns true for strings', () => {
    expect(isString('')).toBe(true);
  });
  test('Returns false for not-strings', () => {
    expect(isString(0)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString(() => undefined)).toBe(false);
  });
});
