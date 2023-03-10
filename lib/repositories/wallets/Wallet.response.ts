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
