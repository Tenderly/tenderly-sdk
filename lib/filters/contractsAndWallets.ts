import { Network } from '../types';
import { VerifiedContractResponse } from '../repositories/contracts/contracts.types';
import { WalletResponse } from '../repositories/wallets/wallets.types';

type FilterMapKeys = 'displayName' | 'tags' | 'network';

export function filterByDisplayName(
  contractOrWallet: VerifiedContractResponse | WalletResponse,
  displayNames?: string | string[],
) {
  if (!displayNames) {
    return true;
  }

  if (displayNames.length === 0) {
    return true;
  }

  if (typeof contractOrWallet.display_name !== 'string') {
    return false;
  }

  if (Array.isArray(displayNames)) {
    return displayNames.some(name => (contractOrWallet.display_name as string).includes(name));
  }

  return contractOrWallet.display_name.includes(displayNames);
}

export function filterByTags(
  contractOrWallet: VerifiedContractResponse | WalletResponse,
  tags?: string | string[],
) {
  if (!tags) {
    return true;
  }

  if (tags.length === 0) {
    return true;
  }

  if (!contractOrWallet.tags) {
    return false;
  }

  if (Array.isArray(tags)) {
    return tags.some(tagFromFilter =>
      contractOrWallet.tags.some(({ tag }) => tag === tagFromFilter),
    );
  }

  return contractOrWallet.tags.some(({ tag }) => tag === tags);
}

export function filterByNetwork(
  contractOrWallet: VerifiedContractResponse | WalletResponse,
  networks?: Network | Network[],
) {
  if (!networks) {
    return true;
  }

  if (Array.isArray(networks) && networks.length === 0) {
    return true;
  }

  if (contractOrWallet.account_type === 'contract') {
    if (Array.isArray(networks)) {
      return networks.some(net => +contractOrWallet.contract.network_id === net);
    }
    return +contractOrWallet.contract.network_id === networks;
  }

  if (contractOrWallet.account_type === 'wallet') {
    if (Array.isArray(networks)) {
      return networks.some(net => +contractOrWallet.account.network_id === net);
    }

    return +contractOrWallet.account.network_id === networks;
  }

  return false;
}

export const contractsOrWalletsFilterMap = new Map<
  FilterMapKeys,
  (contractOrWallet: VerifiedContractResponse | WalletResponse, value: unknown) => boolean
>([
  ['displayName', filterByDisplayName],
  ['tags', filterByTags],
  ['network', filterByNetwork],
]);

export interface ContractsAndWalletsFilterFields
  extends Record<string, unknown>,
    Partial<Record<FilterMapKeys, unknown>> {
  tags?: string | string[];
  displayName?: string | string[];
  network?: Network | Network[];
}
