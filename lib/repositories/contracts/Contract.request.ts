export interface ContractRequest extends Record<string, string> {
  address: string;
  network_id: string;
}