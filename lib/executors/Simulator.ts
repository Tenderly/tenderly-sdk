import { ApiClient } from "../core/ApiClient";
import { TenderlyConfiguration, TransactionParameters } from "../models";
import { SimulationRequest } from "./Simulation.request";
import { SimulationResponse } from "./Simulation.response";

export class Simulator {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient, configuration: TenderlyConfiguration }) {
    this.api = api;
    this.configuration = configuration;
  }

  async simulateTransaction(
    {
      transaction,
      blockNumber,
      override
    }: {
      transaction: TransactionParameters,
      blockNumber?: number,
      override?: Record<string, unknown>
    }): Promise<SimulationResponse['transaction']> {
    try {
      const { data } = await this.api.post<SimulationRequest, SimulationResponse>(`
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /simulate
        `, {
        block_number: blockNumber,
        from: transaction.from,
        to: transaction.to,
        input: transaction.input,
        state_objects: override,
        network_id: `${this.configuration.network}`,
      });

      return data.transaction;
    } catch (error) {
      console.error('Error: ', error);
    }
  }

};