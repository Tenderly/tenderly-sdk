import { Network, TenderlyConfiguration } from '../../types';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import {
  TenderlyWallet,
  WalletResponse,
  UpdateWalletRequest,
  WalletRequest,
  Wallet,
} from './wallets.types';
import { GetByParams } from '../contracts/contracts.types';
import { handleError } from '../../errors';
import { ApiClientProvider } from '../../core/ApiClientProvider';
import { NotFoundError } from '../../errors/NotFoundError';

function getContractFromResponse(contractResponse: WalletResponse): Wallet {
  const getterProperty: 'account' | 'contract' = contractResponse.account ? 'account' : 'contract';

  return {
    address: contractResponse[getterProperty].address,
    network: Number.parseInt(contractResponse[getterProperty].network_id) as unknown as Network,
  };
}

function mapWalletResponseToWalletModel(walletResponse: WalletResponse) {
  const retVal: TenderlyWallet = getContractFromResponse(walletResponse);

  if (walletResponse.tags) {
    retVal.tags = walletResponse.tags.map(({ tag }) => tag);
  }

  if (walletResponse.display_name) {
    retVal.displayName = walletResponse.display_name;
  }

  return retVal;
}

function mapWalletModelToWalletRequest(wallet: Partial<TenderlyWallet>): WalletRequest {
  return {
    address: wallet.address,
    display_name: wallet.displayName,
    network_ids: [`${wallet.network}`],
  };
}

export class WalletRepository implements Repository<TenderlyWallet> {
  private readonly api: ApiClient;
  private readonly apiV2: ApiClient;
  private readonly configuration: TenderlyConfiguration;

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

  /**
   * Get a contract by address if it exists in the Tenderly's instances' project
   * @param address - The address of the contract
   * @returns The contract object in a plain format
   * @example
   * const contract = await tenderly.contracts.get('0x1234567890');
   */
  async get(address: string) {
    try {
      const { data } = await this.apiV2.get<{ accounts: WalletResponse[] }>(
        `
      /accounts/${this.configuration.accountName}
      /projects/${this.configuration.projectName}
      /accounts
    `,
        {
          'addresses[]': [address.toLowerCase()],
          'networkIDs[]': [`${this.configuration.network}`],
          'types[]': ['wallet'],
        },
      );

      if (!data?.accounts || data?.accounts?.length === 0) {
        throw new NotFoundError(`Wallet with address ${address} not found`);
      }

      return mapWalletResponseToWalletModel(data.accounts[0]);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Add a wallet to the project.
   * @param address - The address of the wallet
   * @param walletData - Values to populate the displayName, and tags with
   * @returns The wallet object in a plain format
   * @example
   * const wallet = await tenderly.contracts.add('0x1234567890', { displayName: 'My Wallet', tags: ['my-tag'] });
   */
  async add(address: string, walletData?: { displayName?: string; tags?: string[] }) {
    try {
      await this.api.post<WalletRequest, WalletResponse>(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /wallet
      `,
        mapWalletModelToWalletRequest({
          address: address.toLowerCase(),
          network: this.configuration.network,
          ...walletData,
        }),
      );
      if (!!walletData?.tags && walletData?.tags?.length > 0) {
        await Promise.all(
          walletData?.tags?.map(tag =>
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
          ),
        );
      }
      return this.get(address);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Remove a wallet from the Tenderly instances' project.
   * @param address - The address of the wallet
   * @returns {Promise<void>}
   * @example
   * await tenderly.contracts.remove('0x1234567890');
   */
  async remove(address: string) {
    try {
      await this.api.delete(
        `
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts
      `,
        { account_ids: [`eth:${this.configuration.network}:${address}`] },
      );
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update a wallet's displayName and/or tags.
   * @param address - The address of the wallet
   * @param payload - The values to update the wallet with
   * @returns The wallet object in a plain format
   * @example
   * const wallet = await tenderly.contracts.update('0x1234567890', {
   *   displayName: 'My Wallet',
   *   appendTags: ['my-tag']
   * });
   * const wallet = await tenderly.contracts.update('0x1234567890', { displayName: 'My Wallet' });
   * const wallet = await tenderly.contracts.update('0x1234567890', { appendTags: ['my-tag'] });
   */
  async update(address: string, payload: UpdateWalletRequest) {
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
   * Get all wallets in the Tenderly instances' project.
   *
   */
  async getAll(): Promise<Wallet[]> {
    try {
      const wallets = await this.apiV2.get<{ accounts: WalletResponse[] }>(
        `
      /accounts/${this.configuration.accountName}
      /projects/${this.configuration.projectName}
      /accounts
    `,
        { 'types[]': 'wallet' },
      );

      if (wallets?.data?.accounts?.length) {
        return wallets.data.accounts.map(mapWalletResponseToWalletModel);
      } else {
        return [];
      }
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get all wallets in the Tenderly instances' project.
   * @param queryObject - The query object to filter the wallets with
   * @returns An array of wallets in a plain format
   * @example
   * const wallets = await tenderly.contracts.getBy();
   * const wallets = await tenderly.contracts.getBy({
   *   network: Network.Mainnet,
   *   displayName: 'My Wallet',
   *   tags: ['my-tag']
   * });
   */
  async getBy(queryObject: GetByParams = {}): Promise<TenderlyWallet[]> {
    try {
      const queryParams = this.buildQueryParams(queryObject);
      const wallets = await this.apiV2.get<{ accounts: WalletResponse[] }>(
        `
      /accounts/${this.configuration.accountName}
      /projects/${this.configuration.projectName}
      /accounts
    `,
        { ...queryParams, 'types[]': 'wallet' },
      );

      if (wallets?.data?.accounts?.length) {
        return wallets.data.accounts.map(mapWalletResponseToWalletModel);
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
}
