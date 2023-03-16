import { Network, TenderlyConfiguration } from '../../models';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import { Wallet, WalletResponse, UpdateWalletRequest, WalletRequest } from './Wallet.models';
import { GetByParams } from '../contracts/Contract.models';
import { filterEntities } from '../../filters';
import { contractsOrWalletsFilterMap } from '../../filters/contractsAndWallets';

function mapWalletResponseToWalletModel(walletResponse: WalletResponse) {
  const retVal: Wallet = {
    address: walletResponse.account.address,
    network: Number.parseInt(walletResponse.account.network_id) as unknown as Network,
  };

  if (walletResponse.tags) {
    retVal.tags = walletResponse.tags.map(({ tag }) => tag);
  }

  if (walletResponse.display_name) {
    retVal.displayName = walletResponse.display_name;
  }

  return retVal;
}

function mapWalletModelToWalletRequest(wallet: Partial<Wallet>): WalletRequest {
  return {
    address: wallet.address,
    display_name: wallet.displayName,
    network_ids: [`${wallet.network}`],
  };
}

export class WalletRepository implements Repository<Wallet> {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient; configuration: TenderlyConfiguration }) {
    this.api = api;
    this.configuration = configuration;
  }

  /**
   * Get a wallet by address if it exists in the Tenderly's instances' project
   *
   * @param {string} address - The address of the wallet
   * @returns The wallet object in a plain format
   * @example
   * const wallet = await tenderly.contracts.get('0x1234567890');
   */
  get = async (address: string) => {
    const { data } = await this.api.get<WalletResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /wallet/${address}
      /network/${this.configuration.network}
    `);

    return mapWalletResponseToWalletModel(data);
  };

  /**
   * Add a wallet to the project.
   * @param address - The address of the wallet
   * @param walletData - Values to populate the displayName, and tags with
   * @returns The wallet object in a plain format
   * @example
   * const wallet = await tenderly.contracts.add('0x1234567890', { displayName: 'My Wallet', tags: ['my-tag'] });
   */
  add = async (address: string, walletData?: Partial<Wallet>) => {
    const { data } = await this.api.post<WalletRequest, WalletResponse>(
      `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /wallet
      `,
      mapWalletModelToWalletRequest({
        address,
        network: this.configuration.network,
        ...walletData,
      }),
    );

    return mapWalletResponseToWalletModel(data[0]);
  };

  /**
   * Remove a wallet from the Tenderly instances' project.
   * @param address - The address of the wallet
   * @returns {Promise<void>}
   * @example
   * await tenderly.contracts.remove('0x1234567890');
   */
  remove = async (address: string) => {
    await this.api.delete(
      `
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts
      `,
      { account_ids: [`eth:${this.configuration.network}:${address}`] },
    );
  };

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
  update = async (address: string, payload: UpdateWalletRequest) => {
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
  getBy = async (queryObject: GetByParams = {}) => {
    const wallets = await this.api.get<WalletResponse[]>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts?accountType=wallet
    `);

    return filterEntities(wallets.data, queryObject, contractsOrWalletsFilterMap).map(
      mapWalletResponseToWalletModel,
    );
  };
}
