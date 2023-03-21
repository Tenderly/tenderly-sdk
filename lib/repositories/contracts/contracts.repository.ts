import { Network, TenderlyConfiguration } from '../../models';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import {
  Contract,
  ContractRequest,
  GetByParams,
  UpdateContractRequest,
  ContractResponse,
  VerificationRequest,
} from './contracts.models';
import { filterEntities } from '../../filters';
import { contractsOrWalletsFilterMap } from '../../filters/contractsAndWallets';

function mapContractResponseToContractModel(contractResponse: ContractResponse): Contract {
  const retVal: Contract = {
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

function mapContractModelToContractRequest(contract: Contract): ContractRequest {
  return {
    address: contract.address,
    network_id: `${contract.network}`,
    display_name: contract.displayName,
  };
}

export class ContractRepository implements Repository<Contract> {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient; configuration: TenderlyConfiguration }) {
    this.api = api;
    this.configuration = configuration;
  }

  /**
   * Get a contract by address if it exists in the Tenderly's instances' project
   * @param address - The address of the contract
   * @returns The contract object in a plain format
   * @example
   * const contract = await tenderly.contracts.get('0x1234567890');
   */
  get = async (address: string) => {
    const { data } = await this.api.get<ContractResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contract/${this.configuration.network}/${address}
    `);

    return mapContractResponseToContractModel(data);
  };

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
  add = async (address: string, contractData: Partial<Omit<Contract, 'address'>> = {}) => {
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
  };

  /**
   * Remove a contract from the Tenderly's instances' project
   * @param address - The address of the contract
   * @returns The contract object in a plain format
   * @example
   * await tenderly.contracts.remove('0x1234567890');
   */
  remove = async (address: string) => {
    await this.api.delete(
      `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /contract/${this.configuration.network}/${address}
      `,
    );
  };

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
  update = async (address: string, payload: UpdateContractRequest) => {
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
  };

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
  getBy = async (queryObject: GetByParams = {}) => {
    const contracts = await this.api.get<ContractResponse[]>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts
    `);

    const retVal = filterEntities<ContractResponse>(
      contracts.data,
      queryObject,
      contractsOrWalletsFilterMap,
    ).map(mapContractResponseToContractModel);

    return retVal;
  };

  async verify(address: string, verificationRequest: VerificationRequest) {
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
  }
}
