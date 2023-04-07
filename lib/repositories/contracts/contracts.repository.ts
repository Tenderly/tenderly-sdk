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
  Contract,
} from './contracts.types';
import { handleError } from '../../errors';
import { ApiClientProvider } from '../../core/ApiClientProvider';
import { NotFoundError } from '../../errors/NotFoundError';

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
  private readonly apiV1: ApiClient;
  private readonly apiV2: ApiClient;

  private readonly configuration: TenderlyConfiguration;

  constructor({
    apiProvider,
    configuration,
  }: {
    apiProvider: ApiClientProvider;
    configuration: TenderlyConfiguration;
  }) {
    this.apiV1 = apiProvider.getApiClient({ version: 'v1' });
    this.apiV2 = apiProvider.getApiClient({ version: 'v2' });
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
      const result = await this.apiV2.get<{ accounts: ContractResponse[] }>(
        `
      /accounts/${this.configuration.accountName}
      /projects/${this.configuration.projectName}
      /accounts
    `,
        {
          'addresses[]': [address],
          'networkIDs[]': [`${this.configuration.network}`],
          'types[]': ['contract', 'unverified_contract'],
        },
      );

      if (!result.data?.accounts || result.data?.accounts?.length === 0) {
        throw new NotFoundError(`Contract with address ${address} not found`);
      }

      return mapContractResponseToContractModel(result.data.accounts[0]);
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
   */
  async add(address: string, contractData: { displayName?: string } = {}) {
    try {
      await this.apiV1.post<ContractRequest, ContractResponse>(
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

      return this.get(address);
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
      await this.apiV1.delete(
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
        this.apiV1.post(
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
          this.apiV1.post(
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

  async getAll(): Promise<Contract[]> {
    try {
      const wallets = await this.apiV1.get<{ accounts: ContractResponse[] }>(
        `
      /accounts/${this.configuration.accountName}
      /projects/${this.configuration.projectName}
      /accounts
    `,
        { 'types[]': 'contract' },
      );

      return wallets.data.accounts.map(mapContractResponseToContractModel);
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
   *   displayName: ['MyContract']
   * });
   */
  async getBy(queryObject: GetByParams = {}): Promise<TenderlyContract[]> {
    try {
      const queryParams = this.buildQueryParams(queryObject);
      const contracts = await this.apiV2.get<{ accounts: ContractResponse[] }>(
        `
      /accounts/${this.configuration.accountName}
      /projects/${this.configuration.projectName}
      /accounts
    `,
        { ...queryParams, 'types[]': 'contract' },
      );

      if (contracts?.data?.accounts?.length) {
        return contracts.data.accounts.map(mapContractResponseToContractModel);
      } else {
        return [];
      }
    } catch (error) {
      handleError(error);
    }
  }

  private buildQueryParams(queryObject: GetByParams = {}) {
    const queryParams: { [key: string]: string | string[] } = {
      'networkIDs[]': `${this.configuration.network}`,
    };

    if (queryObject.displayNames && queryObject.displayNames.filter(x => !!x).length > 0) {
      queryParams['display_names[]'] = queryObject.displayNames;
    }

    if (queryObject.tags && queryObject.tags.filter(x => !!x).length > 0) {
      queryParams['tags[]'] = queryObject.tags;
    }

    return queryParams;
  }

  async verify(address: string, verificationRequest: VerificationRequest) {
    try {
      const result = await this.apiV1.post(
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
