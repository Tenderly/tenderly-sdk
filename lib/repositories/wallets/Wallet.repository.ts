import { Network, TenderlyConfiguration } from "../../models";
import { Repository } from "../Repository";
import { ApiClient } from "../../core/ApiClient";
import { Wallet } from "./Wallet.model";
import { WalletResponse } from "./Wallet.response";
import { WalletRequest } from "./Wallet.request";

function mapWalletResponseToWalletModel(walletResponse: WalletResponse): Wallet {
  return ({
    address: walletResponse.account.address,
    network: Number.parseInt(walletResponse.account.network_id) as unknown as Network,
    displayName: walletResponse.display_name,
  });
}

function mapWalletModelToWalletRequest(wallet: Partial<Wallet>): WalletRequest {
  return ({
    address: wallet.address,
    display_name: wallet?.displayName,
    network_ids: [`${wallet.network}`],
  });
}

export class WalletRepository implements Repository<Wallet> {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient, configuration: TenderlyConfiguration }) {
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
    `
      );

      return (mapWalletResponseToWalletModel(data));
    }
    catch (error) {
      console.error('Error: ', error);
    }

  };

  add = async (address: string, walletData?: Partial<Wallet>) => {
    try {
      const { data } = await this.api.post<WalletRequest, WalletResponse>(`
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /wallet
      `, mapWalletModelToWalletRequest({
        address,
        network: this.configuration.network
        , ...walletData
      })
      );

      return (mapWalletResponseToWalletModel(data[0]));
    }
    catch (error) {
      console.error('Error: ', error);
    }
  };

  remove = async (address: string) => {
    try {
      await this.api.delete(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts
      `, { account_ids: [`eth:${this.configuration.network}:${address}`] }
      );
    }
    catch (error) {
      console.error('Error: ', error);
    }
  };
  update = (address: string, data: Partial<Wallet>) =>
    new Promise((resolve: (x: Wallet) => void) => { resolve(({ address: address, ...data } as Wallet)); });
  getBy = (queryObject: Partial<Wallet>) =>
    new Promise((resolve: (x: Wallet) => void) => { resolve((queryObject as Wallet)); });
}