import { Network } from '../../models';

export interface Wallet {
  address: string;
  displayName?: string;
  tags?: string[];
  network: Network;
}

export type WalletRequest = {
  address: string;
  display_name: string;
  network_ids: string[];
};

export type WalletResponse = {
  id: string;
  account_type: 'wallet';
  display_name: string;
  account: {
    id: string;
    contract_id: string;
    balance: string;
    network_id: string;
    address: string;
    // ...
  };
  tags?: { tag: string }[];
};

export type UpdateWalletRequest = {
  displayName?: string;
  appendTags?: string[];
};
