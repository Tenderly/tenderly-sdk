import { ApiClient } from "../core/ApiClient";

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
}

export type TenderlyConfiguration = {
  accountName: string;
  projectName: string;
  accessKey: string;
  network: Network;
}

export type Transaction = {
  from: string;
  to: string;
  input: string;
}

export type Simulation = {
  simulationId: string;
  override: Record<string, string | number | boolean>;
  blockNumber: number;
  transaction: Transaction;
}

export class Simulator {
  api: ApiClient;

  constructor({ api }: { api: ApiClient }) {
    this.api = api;
  }

  simulateTransaction(
    {
      transaction,
      blockNumber,
      override
    }: {
      transaction: Transaction,
      blockNumber: number,
      override: Record<string, string | number | boolean>
    }): Simulation {

    return {
      simulationId: 'simulationId',
      transaction: transaction,
      blockNumber: blockNumber,
      override: override
    };
  }

};