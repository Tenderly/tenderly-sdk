import { Network, Path, TenderlyConfiguration } from '../../types';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import {
  Contract,
  ContractRequest,
  ContractResponse,
  GetByParams, SolcConfig,
  TenderlyContract,
  UpdateContractRequest,
  VerificationRequest,
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

      return await this.get(address);
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
   * const contracts = await tenderly.contracts.getBy({
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
    if (!isFullyQualifiedContractName(verificationRequest.contractToVerify)) {
      // @maleksandar: Please check if this error should be thrown like this
      throw new Error(
        `The contract name '${verificationRequest.contractToVerify}' is not a fully qualified name. Please use the fully qualified name (e.g. path/to/file.sol:ContractName)`,
      );
    }
    try {
      const payload = {
        contracts: [
          {
            compiler: _repackLibraries(verificationRequest.solc),
            sources: _mapSolcSourcesToTenderlySources(verificationRequest.solc.sources),
            networks: {
              [this.configuration.network]: { address },
            },
            contractToVerify: verificationRequest.contractToVerify,
          },
        ],
      };

      const result = await this.apiV1.post(
        verificationRequest.config.mode === 'private'
          ? // eslint-disable-next-line max-len
          `/accounts/${this.configuration.accountName}/projects/${this.configuration.projectName}/contracts/verify`
          : '/public/contracts/verify',
        payload,
      );

      if (
        (result.data as { bytecode_mismatch_errors: unknown; contracts: unknown }).bytecode_mismatch_errors
      ) {
        throw new Error('Bytecode mismatch');
      }

      return this.get(address);
    } catch (error) {
      handleError(error);
    }

    function _mapSolcSourcesToTenderlySources(sources: Record<Path, { name?: string; content: string }>) {
      const tenderlySources: Record<Path, { name?: string; code: string }> = {};
      for (const path in sources) {
        tenderlySources[path] = {
          code: sources[path].content,
        };
      }
      return tenderlySources;
    }

    function _repackLibraries(compiler: SolcConfig): SolcConfig {
      if (!compiler?.settings?.libraries) {
        return compiler;
      }
      const libraries: any = {};
      for (const [fileName, libVal] of Object.entries(compiler.settings.libraries)) {
        if (libraries[fileName] === undefined) {
          libraries[fileName] = { addresses: {} };
        }
        for (const [libName, libAddress] of Object.entries(libVal as any)) {
          libraries[fileName].addresses[libName] = libAddress;
        }
      }
      compiler.settings.libraries = libraries;

      return compiler;
    }

    function isFullyQualifiedContractName(contractName: string): boolean {
      // Regex pattern for fully qualified contract name
      // matches `path/to/file.sol:ContractName`
      const pattern = /^(.+)\.sol:([a-zA-Z_][a-zA-Z_0-9]*)$/;

      // Test if the contractName string matches the pattern
      return pattern.test(contractName);
    }
  };
}
