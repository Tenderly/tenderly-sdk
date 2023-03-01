import { Network } from "../../models";

export interface Wallet {
  address: string;
  displayName: string;
  network: Network;
}