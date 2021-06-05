import { isObject, isString } from '../src/utils/isCheckValue';

describe('utils.ts', () => {
  test('isObject is return true', () => {
    expect(isObject({})).toBe(true);
  });

  test('isObject is return false', () => {
    expect(isObject(3)).toBe(false);
  });

  test('isString is return true', () => {
    expect(isString('test')).toBe(true);
  });
});
