export type WalletResponse = {
  id: string;
  display_name: string;
  account: {
    id: string;
    contract_id: string;
    balance: string;
    network_id: string;
    address: string;
    // ...
  };

}