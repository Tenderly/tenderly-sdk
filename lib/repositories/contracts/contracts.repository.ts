import { Network, Path, TenderlyConfiguration, Web3Address } from '../../common.types';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import {
  Contract,
  ContractRequest,
  ContractResponse,
  GetByParams,
  SolcConfig,
  TenderlyContract,
  TenderlySolcConfigLibraries,
  UpdateContractRequest,
  VerificationRequest,
  VerificationResponse,
} from './contracts.types';
import { ApiClientProvider } from '../../core/ApiClientProvider';
import {
  handleError,
  NotFoundError,
  CompilationError,
  BytecodeMismatchError,
  UnexpectedVerificationError,
} from '../../errors';

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

      if (!result.data?.accounts || !result.data.accounts[0]) {
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
   * @param payload - The data of the contract
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

  async getAll(): Promise<Contract[] | undefined> {
    try {
      const wallets = await this.apiV2.get<{ accounts: ContractResponse[] }>(
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
  async getBy(queryObject: GetByParams = {}): Promise<TenderlyContract[] | undefined> {
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

  /**Verifies a contract on Tenderly by submitting a verification request with
   * the provided address and verification details.
   * @param {string} address - The address of the contract to be verified.
   * @param {VerificationRequest} verificationRequest - Details of the verification request.
   * @returns {Promise<TenderlyContract>} - A Promise that resolves to a TenderlyContract
   * object representing the verified contract.
   */
  async verify(
    address: string,
    verificationRequest: VerificationRequest,
  ): Promise<TenderlyContract | undefined> {
    if (!this._isFullyQualifiedContractName(verificationRequest.contractToVerify)) {
      throw new Error(
        // eslint-disable-next-line max-len
        `The contract name '${verificationRequest.contractToVerify}' is not a fully qualified name. Please use the fully qualified name (e.g. path/to/file.sol:ContractName)`,
      );
    }
    try {
      const payload = {
        contracts: [
          {
            compiler: this._repackLibraries(verificationRequest.solc),
            sources: this._mapSolcSourcesToTenderlySources(verificationRequest.solc.sources),
            networks: {
              [this.configuration.network]: { address },
            },
            contractToVerify: verificationRequest.contractToVerify,
          },
        ],
      };

      const response = await this.apiV1.post(
        verificationRequest.config.mode === 'private'
          ? // eslint-disable-next-line max-len
            `/accounts/${this.configuration.accountName}/projects/${this.configuration.projectName}/contracts/verify`
          : '/public/contracts/verify',
        payload,
      );

      const verificationResp = response.data as VerificationResponse;

      if (verificationResp.compilation_errors) {
        throw new CompilationError(
          'There has been a compilation error while trying to verify contracts.',
          verificationResp.compilation_errors,
        );
      }
      if (!verificationResp.results || !verificationResp.results[0]) {
        throw new UnexpectedVerificationError(
          // eslint-disable-next-line max-len
          "There has been an unexpected verification error during the verification process. Please check your contract's source code and try again.",
        );
      }
      if (verificationResp.results[0].bytecode_mismatch_error) {
        throw new BytecodeMismatchError(
          'There has been a bytecode mismatch error while trying to verify contracts.',
          verificationResp.results[0].bytecode_mismatch_error,
        );
      }

      return this.add(address);
    } catch (error) {
      handleError(error);
    }
  }

  _mapSolcSourcesToTenderlySources(sources: Record<Path, { name?: string; content: string }>) {
    const tenderlySources: Record<Path, { name?: string; code: string }> = {};

    Object.entries(sources).forEach(([path, source]) => {
      tenderlySources[path] = { code: source.content };
    });

    return tenderlySources;
  }

  _repackLibraries(solcConfig: SolcConfig) {
    const tenderlySolcConfig = this._copySolcConfigToTenderlySolcConfig(solcConfig);

    const solcConfigSettings = solcConfig.settings as {
      libraries?: Record<Path, Record<string, Web3Address>>;
    };
    if (!solcConfigSettings.libraries) {
      return tenderlySolcConfig;
    }
    const libraries: TenderlySolcConfigLibraries = {};
    for (const [fileName, libVal] of Object.entries(solcConfigSettings.libraries)) {
      for (const [libName, libAddress] of Object.entries(libVal)) {
        libraries[fileName] = {
          addresses: {
            ...libraries?.[fileName]?.addresses,
            [libName]: libAddress,
          },
        };
      }
    }
    (tenderlySolcConfig.settings as { libraries: TenderlySolcConfigLibraries }).libraries =
      libraries;

    return tenderlySolcConfig;
  }

  _isFullyQualifiedContractName(contractName: string): boolean {
    // Regex pattern for fully qualified contract name
    // matches `path/to/file.sol:ContractName`
    const pattern = /^(.+)\.sol:([a-zA-Z_][a-zA-Z_0-9]*)$/;

    // Test if the contractName string matches the pattern
    return pattern.test(contractName);
  }

  _copySolcConfigToTenderlySolcConfig(solcConfig: SolcConfig): Omit<SolcConfig, 'sources'> {
    // remove libraries from settings since the backend accepts a different format of libraries
    const { libraries: _, ...settings } = solcConfig.settings as {
      libraries?: unknown;
    };

    return {
      version: solcConfig.version,
      settings: settings,
    };
  }
}
