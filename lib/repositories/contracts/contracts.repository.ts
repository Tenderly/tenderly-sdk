import { Network, TenderlyConfiguration } from '../../types';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import {
  TenderlyContract,
  ContractRequest,
  GetByParams,
  UpdateContractRequest,
  ContractResponse,
  VerificationRequest,
} from './contracts.types';
import { handleError } from '../../errors';

function mapContractResponseToContractModel(contractResponse: ContractResponse): TenderlyContract {
  const retVal: TenderlyContract = {
    address: contractResponse.contract.address,
    network: Number.parseInt(contractResponse.contract.network_id) as unknown as Network,
  };

  if (contractResponse.display_name) {
    retVal.displayName = contractResponse.display_name;
  }

  if (contractResponse.tags) {
    retVal.tags = contractResponse.tags.map(({ tag }) => tag);
  }

  return retVal;
}

function mapContractModelToContractRequest(contract: TenderlyContract): ContractRequest {
  return {
    address: contract.address,
    network_id: `${contract.network}`,
    display_name: contract.displayName,
  };
}

export class ContractRepository implements Repository<TenderlyContract> {
  api: ApiClient;
  apiV2: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({
    api,
    apiV2,
    configuration,
  }: {
    api: ApiClient;
    apiV2: ApiClient;
    configuration: TenderlyConfiguration;
  }) {
    this.api = api;
    this.apiV2 = apiV2;
    this.configuration = configuration;
  }

  /**
   * Get a contract by address if it exists in the Tenderly's instances' project
   * @param address - The address of the contract
   * @returns The contract object in a plain format
   * @example
   * const contract = await tenderly.contracts.get('0x1234567890');
   */
  async get(address: string) {
    try {
      const { data } = await this.api.get<ContractResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contract/${this.configuration.network}/${address}
    `);
      return mapContractResponseToContractModel(data);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Add a contract to the Tenderly's instances' project
   * @param address - The address of the contract
   * @param contractData - The data of the contract
   * @returns The contract object in a plain format
   * @example
   * const contract = await tenderly.contracts.add('0x1234567890');
   * // or
   * const contract = await tenderly.contracts.add('0x1234567890', { displayName: 'MyContract' });
   * // or
   * const contract = await tenderly.contracts.add('0x1234567890', { tags: ['my-tag'] });
   * // or
   * const contract = await tenderly.contracts.add('0x1234567890', { displayName: 'MyContract', tags: ['my-tag'] });
   */
  async add(address: string, contractData: Partial<Omit<TenderlyContract, 'address'>> = {}) {
    try {
      const { data } = await this.api.post<ContractRequest, ContractResponse>(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /address
      `,
        mapContractModelToContractRequest({
          address,
          network: this.configuration.network,
          ...contractData,
        }),
      );

      return mapContractResponseToContractModel(data);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Remove a contract from the Tenderly's instances' project
   * @param address - The address of the contract
   * @returns The contract object in a plain format
   * @example
   * await tenderly.contracts.remove('0x1234567890');
   */
  async remove(address: string) {
    try {
      await this.api.delete(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /contract/${this.configuration.network}/${address}
      `,
      );
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update a contract in the Tenderly's instances' project
   * @param address - The address of the contract
   * @param contractData - The data of the contract
   * @returns The contract object in a plain format
   * @example
   * const contract = await tenderly.contracts.update('0x1234567890', { displayName: 'MyContract' });
   * // or
   * const contract = await tenderly.contracts.update('0x1234567890', { tags: ['my-tag'] });
   * // or
   * const contract = await tenderly.contracts.update('0x1234567890', {
   *   displayName: 'MyContract',
   *   appendTags: ['my-tag']
   * });
   * // or
   * const contract = await tenderly.contracts.update('0x1234567890', { appendTags: ['my-tag'] });
   */
  async update(address: string, payload: UpdateContractRequest) {
    try {
      let promiseArray = payload.appendTags?.map(tag =>
        this.api.post(
          `
          /account/${this.configuration.accountName}
          /project/${this.configuration.projectName}
          /tag
        `,
          {
            contract_ids: [`eth:${this.configuration.network}:${address}`],
            tag,
          },
        ),
      );

      promiseArray ||= [];

      if (payload.displayName) {
        promiseArray.push(
          this.api.post(
            `
            /account/${this.configuration.accountName}
            /project/${this.configuration.projectName}
            /contract/${this.configuration.network}/${address}
            /rename
          `,
            { display_name: payload.displayName },
          ),
        );
      }

      await Promise.all(promiseArray);

      return this.get(address);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get all contracts in the Tenderly's instances' project
   * @param queryObject - The query object
   * @returns The contract objects in a plain format
   * @example
   * const contracts = await tenderly.contracts.getBy();
   * const contracts = awiat tenderly.contracts.getBy({
   *   tags: ['my-tag'],
   *   displayName: ['MyContract'],
   *   network: [Networks.Mainnet, Networks.Rinkeby],
   * });
   */
  async getBy(queryObject: GetByParams = {}) {
    try {
      const queryFilter = Object.entries(queryObject)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map(valueElement => `${key}s=${valueElement}`).join('&');
          }

          return `${key}=${value}`;
        })
        .join('&');

      const response = await this.apiV2.get<{ contracts?: ContractResponse[] }>(`
        /accounts/${this.configuration.accountName}
        /projects/${this.configuration.projectName}
        /contracts?${queryFilter}`);

      return response.data.contracts?.map(mapContractResponseToContractModel) || [];
    } catch (error) {
      handleError(error);
    }
  }

  async verify(address: string, verificationRequest: VerificationRequest) {
    try {
      const result = await this.api.post(
        `account/${this.configuration.accountName}/project/${this.configuration.projectName}/contracts`,
        {
          config: {
            optimization_count: verificationRequest.solc.compiler.settings.optimizer.enabled
              ? verificationRequest.solc.compiler.settings.optimizer.runs
              : null,
          },
          contracts: Object.keys(verificationRequest.solc.sources).map((path: string) => ({
            contractName: verificationRequest.solc.sources[path].name,
            source: verificationRequest.solc.sources[path].source,
            sourcePath: path,
            networks: {
              [this.configuration.network]: { address: address, links: {} },
            },
            compiler: {
              name: 'solc',
              version: verificationRequest.solc.compiler.version,
            },
          })),
        },
      );

      return result;
    } catch (error) {
      handleError(error);
    }
  }
}
