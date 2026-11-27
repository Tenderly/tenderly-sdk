import { Network } from '../types';
import { InvalidResponseError } from '../errors';

export function getNetworkFromResponse(networkId: string): Network {
  if (!/^\d+$/.test(networkId)) {
    throw new InvalidResponseError('Invalid network_id in Tenderly response');
  }

  const network = Number.parseInt(networkId, 10);
  if (!Number.isSafeInteger(network)) {
    throw new InvalidResponseError('Invalid network_id in Tenderly response');
  }

  return network as unknown as Network;
}
