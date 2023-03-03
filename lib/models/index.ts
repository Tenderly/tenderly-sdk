// import { ApiClient } from "../core/ApiClient";

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
}

export type TenderlyConfiguration = {
  accountName: string;
  projectName: string;
  accessKey: string;
  network: Network;
}

export type TransactionParameters = {
  from: string;
  to: string;
  input: string;
}

// export type Simulation = {
//   simulationId: string;
//   override: Record<string, string | number | boolean>;
//   blockNumber: number;
//   transaction: TransactionParameters;
// }

// export class Simulator {
//   api: ApiClient;

//   constructor({ api }: { api: ApiClient }) {
//     this.api = api;
//   }

//   simulateTransaction(
//     {
//       transaction,
//       blockNumber,
//       override
//     }: {
//       transaction: TransactionParameters,
//       blockNumber?: number,
//       override?: Record<string, Record<string, string | number | boolean>>
//     }): any {



//     return {
//       simulationId: 'simulationId',
//       transaction: transaction,
//       blockNumber: blockNumber,
//     };
//   }

// };