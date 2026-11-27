import { getNetworkFromResponse } from '../lib/repositories/response';

const message = 'Invalid network_id in Tenderly response';

describe('getNetworkFromResponse', () => {
  test('returns a valid numeric network id', () => {
    expect(getNetworkFromResponse('1')).toBe(1);
  });

  test('rejects malformed network ids', () => {
    expect(() => getNetworkFromResponse('1abc')).toThrow(message);
    expect(() => getNetworkFromResponse('abc')).toThrow(message);
    expect(() => getNetworkFromResponse('')).toThrow(message);
  });
});
