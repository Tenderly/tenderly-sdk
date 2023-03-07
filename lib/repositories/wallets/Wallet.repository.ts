import { Network, TenderlyConfiguration } from '../../models';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import { Wallet } from './Wallet.model';
import { WalletResponse } from './Wallet.response';
import { GetByParams } from '../contracts/Contract.request';
import { UpdateWalletRequest } from './UpdateWallet.request';
import { WalletRequest } from './Wallet.request';
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
    display_name: wallet?.displayName,
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

  get = async (address: string) => {
    try {
      const { data } = await this.api.get<WalletResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /wallet/${address}
      /network/${this.configuration.network}
    `);

      return mapWalletResponseToWalletModel(data);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  add = async (address: string, walletData?: Partial<Wallet>) => {
    try {
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
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  remove = async (address: string) => {
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
      console.error('Error: ', error);
    }
  };

  update = async (address: string, payload: UpdateWalletRequest) => {
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
      console.error('Error: ', error);
    }
  };

  getBy = async (queryObject: GetByParams) => {
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
