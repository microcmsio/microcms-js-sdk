import { createClient } from '../src/createClient';

describe('createClient', () => {
  test('Functions is generated to request the API', () => {
    const client = createClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
    });

    expect(typeof client.get === 'function').toBe(true);
    expect(typeof client.getList === 'function').toBe(true);
    expect(typeof client.getListDetail === 'function').toBe(true);
    expect(typeof client.getObject === 'function').toBe(true);
    expect(typeof client.create === 'function').toBe(true);
    expect(typeof client.update === 'function').toBe(true);
    expect(typeof client.delete === 'function').toBe(true);
  });

  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createClient({ serviceDomain: 'foo' })).toThrowError(
      new Error('parameter is required (check serviceDomain and apiKey)')
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createClient({ apiKey: 'foo' })).toThrowError(
      new Error('parameter is required (check serviceDomain and apiKey)')
    );
  });
  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createClient({ serviceDomain: 10, apiKey: 'foo' })
    ).toThrowError(new Error('parameter is not string'));
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createClient({ serviceDomain: 'foo', apiKey: 10 })
    ).toThrowError(new Error('parameter is not string'));
  });
});
