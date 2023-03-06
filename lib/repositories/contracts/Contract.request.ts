import { Network } from "../../models";

export interface ContractRequest extends Record<string, string> {
  address: string;
  network_id: string;
}

export type GetByParams = {
  tags?: string | string[];
  displayName?: string | string[];
  network?: Network | Network[];
};
