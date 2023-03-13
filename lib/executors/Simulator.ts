import { ApiClient } from "../core/ApiClient";
import {
  SimulationDetails,
  SimulationRequest,
  SimulationResponse
} from "./Simulator.models";
import { TenderlyConfiguration } from '../models';

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
    }: SimulationDetails): Promise<SimulationResponse['transaction']> {
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

  async simulateBundle(simulationDetailsArray: SimulationDetails[]) {
    try {
      const { data } = await this.api.post<
        { simulations: SimulationRequest[] },
        { simulation_results: SimulationResponse[] }>(`
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /simulate-batch
        `, {

          simulations: simulationDetailsArray.map((simulationDetails) => ({
            block_number: simulationDetails.blockNumber,
            from: simulationDetails.transaction.from,
            to: simulationDetails.transaction.to,
            input: simulationDetails.transaction.input,
            state_objects: simulationDetails.override,
            network_id: `${this.configuration.network}`,
          }))
        });

      return data;
    } catch (error) {
      console.error('Error: ', error);
    }
  }

};