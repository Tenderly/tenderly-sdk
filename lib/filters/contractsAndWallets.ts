import { Network } from '../models';
import { ContractResponse } from '../repositories/contracts/Contract.response';
import { WalletResponse } from '../repositories/wallets/Wallet.response';

type FilterMapKeys = 'displayName' | 'tags' | 'network';

function filterByDisplayName(
  contractOrWallet: ContractResponse | WalletResponse,
  displayNames?: string | string[],
) {
  if (!displayNames) {
    return true;
  }

  if (typeof contractOrWallet.display_name !== 'string') {
    return false;
  }

  return Array.isArray(displayNames)
    ? displayNames.some(name => (contractOrWallet.display_name as string).includes(name))
    : contractOrWallet.display_name.includes(displayNames);
}

function filterByTags(
  contractOrWallet: ContractResponse | WalletResponse,
  tags?: string | string[],
) {
  if (!tags) {
    return true;
  }

  return Array.isArray(tags)
    ? tags.some(tagFromFilter => contractOrWallet.tags.some(({ tag }) => tag === tagFromFilter))
    : contractOrWallet.tags.some(({ tag }) => tag === tags);
}

function filterByNetwork(
  contractOrWallet: ContractResponse | WalletResponse,
  networks?: Network | Network[],
) {
  if (!networks) {
    return true;
  }

  if ('contract' in contractOrWallet) {
    return Array.isArray(networks)
      ? networks.some(net => +contractOrWallet.contract.network_id === net)
      : +contractOrWallet.contract.network_id === networks;
  }

  return Array.isArray(networks)
    ? networks.some(network => +contractOrWallet.account.network_id === network)
    : +contractOrWallet.account.network_id === networks;
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
