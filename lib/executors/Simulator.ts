import { ApiClient } from '../core/ApiClient';
import { Web3Address } from '../types';
import {
  SimulationParameters,
  SimulationRequest,
  SimulateSimpleResponse,
  SimulationOutput,
  SimulationBundleDetails,
  SimulationBundleRequest,
  EncodeStateRequest,
  StateOverride,
  EncodedStateOverride,
  SimulationParametersOverrides,
  TransactionParameters,
  SimulationRequestOverrides,
  SimulateBundleResponse,
} from './Simulator.types';
import { TenderlyConfiguration } from '../types';
import { handleError } from '../errors';
import { ApiClientProvider } from '../core/ApiClientProvider';
import { EncodingError } from '../errors/EncodingError';

function mapToSimulationResult(simpleSimulationResponse: SimulateSimpleResponse): SimulationOutput {
  return {
    status: simpleSimulationResponse.status,
    gasUsed: simpleSimulationResponse.gas_used,
    cumulativeGasUsed: simpleSimulationResponse.cumulative_gas_used,
    blockNumber: simpleSimulationResponse.block_number,
    type: simpleSimulationResponse.type,
    logsBloom: simpleSimulationResponse.logs_bloom,
    logs: simpleSimulationResponse.logs,
    trace: simpleSimulationResponse.trace,
  };
}

export class Simulator {
  private readonly api: ApiClient;
  private readonly configuration: TenderlyConfiguration;
  private readonly apiV2: ApiClient;

  constructor({
    apiProvider,
    configuration,
  }: {
    apiProvider: ApiClientProvider;
    configuration: TenderlyConfiguration;
  }) {
    this.api = apiProvider.getApiClient({ version: 'v1' });
    this.apiV2 = apiProvider.getApiClient({ version: 'v2' });
    this.configuration = configuration;
  }

  private mapStateOverridesToEncodeStateRequest(
    overrides: SimulationParametersOverrides,
  ): EncodeStateRequest {
    return {
      networkID: `${this.configuration.network}`,
      stateOverrides: Object.keys(overrides)
        .map(contractAddress => ({
          [contractAddress]: overrides[contractAddress as Web3Address].state,
        }))
        .map(x => {
          const y = {};
          Object.keys(x).forEach(key => {
            y[key] = { value: x[key] };
          });
          return y;
        })
        .reduce((acc, curr) => ({ ...acc, ...curr })),
    };
  }

  private mapToEncodedOverrides(
    stateOverrides: Record<Web3Address, StateOverride>,
  ): EncodedStateOverride {
    return Object.keys(stateOverrides)
      .map(address => address.toLowerCase())
      .reduce((acc, curr) => {
        acc[curr] = stateOverrides[curr].value;
        return acc;
      }, {});
  }

  private replaceJSONOverridesWithEncodedOverrides(
    overrides: SimulationParameters['overrides'],
    encodedStateOverrides: EncodedStateOverride,
  ): SimulationRequest['overrides'] {
    if (!overrides) {
      return null;
    }

    return Object.keys(overrides)
      .map(address => address.toLowerCase())
      .reduce((acc, curr: Web3Address) => {
        acc[curr] = {};
        if (encodedStateOverrides[curr]) {
          acc[curr].state_diff = encodedStateOverrides[curr];
        }
        if (overrides[curr].nonce) {
          acc[curr].nonce = overrides[curr].nonce;
        }

        if (overrides[curr].code) {
          acc[curr].code = overrides[curr].code;
        }

        if (overrides[curr].nonce) {
          acc[curr].balance = overrides[curr].nonce;
        }

        return acc;
      }, {});
  }

  private buildSimulationBundleRequest(
    transactions: TransactionParameters[],
    blockNumber: number,
    encodedOverrides: SimulationRequestOverrides,
  ): SimulationBundleRequest {
    return {
      network_id: `${this.configuration.network}`,
      call_args: transactions.map(transaction => ({
        from: transaction.from,
        to: transaction.to,
        gas: transaction.gas,
        gas_price: transaction.gas_price,
        max_fee_per_gas: transaction.max_fee_per_gas,
        max_priority_fee_per_gas: transaction.max_priority_fee_per_gas,
        value: transaction.value,
        data: transaction.input,
        access_list: transaction.access_list,
      })),
      block_number_or_hash: {
        blockNumber: blockNumber,
      },
      overrides: encodedOverrides,
    };
  }

  private buildSimpleSimulationRequest(
    transaction: TransactionParameters,
    blockNumber: number,
    encodedOverrides: SimulationRequestOverrides,
  ): SimulationRequest {
    return {
      network_id: `${this.configuration.network}`,
      call_args: {
        from: transaction.from,
        to: transaction.to,
        gas: transaction.gas,
        gas_price: transaction.gas_price,
        max_fee_per_gas: transaction.max_fee_per_gas,
        max_priority_fee_per_gas: transaction.max_priority_fee_per_gas,
        value: transaction.value,
        data: transaction.input,
        access_list: transaction.access_list,
      },
      block_number_or_hash: {
        blockNumber: blockNumber,
      },
      overrides: encodedOverrides,
    };
  }

  private async encodeOverrideRequest(overrides: SimulationParametersOverrides) {
    const encodedStateOverrides = await this.encodeStateOverrides(overrides);
    return this.replaceJSONOverridesWithEncodedOverrides(overrides, encodedStateOverrides);
  }

  private async encodeStateOverrides(overrides: SimulationParametersOverrides) {
    if (!overrides) {
      return null;
    }
    const encodingRequest = this.mapStateOverridesToEncodeStateRequest(overrides);
    try {
      const { data: encodedStates } = await this.api.post<
        EncodeStateRequest,
        { stateOverrides: StateOverride }
      >(
        `/account/${this.configuration.accountName}
          /project/${this.configuration.projectName}
          /contracts/encode-states
        `,
        encodingRequest,
      );
      return this.mapToEncodedOverrides(encodedStates.stateOverrides);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new EncodingError(error.response.data.error);
      }
      throw error;
    }
  }

  private async executeSimpleSimulationRequest(
    simulationRequest: SimulationRequest,
  ): Promise<SimulateSimpleResponse> {
    const { data } = await this.apiV2.post<SimulationRequest, SimulateSimpleResponse>(
      `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /simulations/simulate
        `,
      simulationRequest,
    );

    return data;
  }

  private async executeSimulationBundleRequest(
    simulationRequest: SimulationBundleRequest,
  ): Promise<SimulateBundleResponse> {
    const { data } = await this.apiV2.post<SimulationBundleRequest, SimulateBundleResponse>(
      `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /simulations/simulate/bundle
        `,
      simulationRequest,
    );

    return data;
  }

  async simulateTransaction({ transaction, blockNumber, overrides }: SimulationParameters) {
    try {
      // Encode overrides if present
      const encodedOverrides = await this.encodeOverrideRequest(overrides);

      // Repackage the request body for the POST request for executing simulation
      const simulationRequest = this.buildSimpleSimulationRequest(
        transaction,
        blockNumber,
        encodedOverrides,
      );

      // Execute the simulation
      const simpleSimulationResponse = await this.executeSimpleSimulationRequest(simulationRequest);

      // Map simulation result into a more user friendly format
      return mapToSimulationResult(simpleSimulationResponse);
    } catch (error) {
      handleError(error);
    }
  }

  async simulateBundle({ transactions, overrides, blockNumber }: SimulationBundleDetails) {
    try {
      // Encode overrides if present
      const encodedOverrides = await this.encodeOverrideRequest(overrides);

      // Repackage the request body for the POST request for executing simulation bundle
      const simulationBundleRequest = this.buildSimulationBundleRequest(
        transactions,
        blockNumber,
        encodedOverrides,
      );

      // Execute the simulation
      const simulationBundleResponse = await this.executeSimulationBundleRequest(
        simulationBundleRequest,
      );

      // Map simulation result into a more user friendly format
      return simulationBundleResponse.simulations.map(simulation =>
        mapToSimulationResult(simulation),
      );
    } catch (error) {
      handleError(error);
    }
  }
}
