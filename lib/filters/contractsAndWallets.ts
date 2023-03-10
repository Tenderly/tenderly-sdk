import { Network } from '../models';
import { ContractResponse } from '../repositories/contracts/Contract.response';
import { WalletResponse } from '../repositories/wallets/Wallet.response';

type FilterMapKeys = 'displayName' | 'tags' | 'network';

export function filterByDisplayName(
  contractOrWallet: ContractResponse | WalletResponse,
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
  contractOrWallet: ContractResponse | WalletResponse,
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
  contractOrWallet: ContractResponse | WalletResponse,
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
  (contractOrWallet: ContractResponse | WalletResponse, value: unknown) => boolean
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
