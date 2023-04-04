import { ApiClient } from '../core/ApiClient';
import { Web3Address } from '../types';
import { SimulationDetails, SimulationRequest, SimulationResponse } from './Simulator.types';
import { TenderlyConfiguration } from '../types';
import { handleError } from '../errors';
import { ApiClientProvider } from '../core/ApiClientProvider';

function mapToStorageOverrides(override: Record<Web3Address, Record<Web3Address, string>>) {
  const result = Object.keys(override).map(key => ({
    address: key,
    storage: override[key].value,
  }));
  const finalResult = {};
  result.forEach(item => {
    finalResult[item.address] = { storage: item.storage };
  });
  return finalResult;
}

export class Simulator {
  private readonly api: ApiClient;
  private readonly apiClientProvider: ApiClientProvider;
  private readonly configuration: TenderlyConfiguration;

  constructor({
    apiProvider,
    configuration,
  }: {
    apiProvider: ApiClientProvider;
    configuration: TenderlyConfiguration;
  }) {
    this.api = apiProvider.getApiClient({ version: 'v1' });
    this.configuration = configuration;
  }

  async simulateTransaction({ transaction, blockNumber, override }: SimulationDetails) {
    try {
      let overrides = null;
      if (override) {
        const { data: encodedStates } = await this.api.post<
          unknown,
          { stateOverrides: Record<Web3Address, Record<Web3Address, string>> }
        >(
          `/account/${this.configuration.accountName}
          /project/${this.configuration.projectName}
          /contracts/encode-states
        `,
          {
            networkID: `${this.configuration.network}`,
            stateOverrides: override,
          },
        );
        overrides = mapToStorageOverrides(encodedStates.stateOverrides);
      }

      const requestBody = {
        block_number: blockNumber,
        from: transaction.from,
        to: transaction.to,
        input: transaction.input,
        state_objects: overrides,
        network_id: `${this.configuration.network}`,
      };

      const { data } = await this.api.post<SimulationRequest, SimulationResponse>(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /simulate
        `,
        requestBody,
      );

      return data.transaction;
    } catch (error) {
      handleError(error);
    }
  }

  async simulateBundle(simulationDetailsArray: SimulationDetails[]) {
    try {
      const encodedStatesPromises = simulationDetailsArray.map(async sd => {
        return this.api.post<
          unknown,
          { stateOverrides: Record<Web3Address, Record<Web3Address, string>> }
        >(
          `/account/${this.configuration.accountName}
          /project/${this.configuration.projectName}
          /contracts/encode-states
        `,
          {
            networkID: `${this.configuration.network}`,
            stateOverrides: sd.override,
          },
        );
      });

      const encodedStates = await Promise.all(encodedStatesPromises);

      const { data } = await this.api.post<
        { simulations: SimulationRequest[] },
        { simulation_results: SimulationResponse[] }
      >(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /simulate-batch
        `,
        {
          simulations: simulationDetailsArray.map((simulationDetails, index) => ({
            block_number: simulationDetails.blockNumber,
            from: simulationDetails.transaction.from,
            to: simulationDetails.transaction.to,
            input: simulationDetails.transaction.input,
            state_objects: mapToStorageOverrides(encodedStates[index].data.stateOverrides),
            network_id: `${this.configuration.network}`,
          })),
        },
      );

      return data.simulation_results.map(simulationResult => simulationResult.transaction);
    } catch (error) {
      handleError(error);
    }
  }
}
