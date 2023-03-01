import { Simulator, TenderlyConfiguration } from "../models";
import { ApiClient } from "./ApiClient";
import { WalletRepository, ContractRepository } from "../repositories";

export class Tenderly {
  public readonly configuration: TenderlyConfiguration;
  public readonly api: ApiClient;

  public readonly contracts: ContractRepository;
  public readonly wallets: WalletRepository;

  constructor(configuration: TenderlyConfiguration) {
    this.configuration = configuration;
    this.api = new ApiClient({ apiKey: configuration.accessKey });

    this.simulator = new Simulator({ api: this.api });

    this.contracts = new ContractRepository({
      api: this.api, configuration
    });

    this.wallets = new WalletRepository({
      api: this.api, configuration
    });
  }

  public simulator: Simulator;

  public with(configurationOverride: Partial<TenderlyConfiguration>) {
    return new Tenderly({ ...this.configuration, ...configurationOverride });
  }
}