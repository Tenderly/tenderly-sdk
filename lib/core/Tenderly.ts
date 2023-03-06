import { TenderlyConfiguration, VerificationRequest } from "../models";
import { ApiClient } from "./ApiClient";
import { WalletRepository, ContractRepository } from "../repositories";
import { Simulator } from "../executors";

export class Tenderly {
  public readonly configuration: TenderlyConfiguration;
  public readonly api: ApiClient;

  public readonly contracts: ContractRepository &
  { verify: (address: string, verificationRequest: VerificationRequest) => Promise<any> };
  public readonly wallets: WalletRepository;
  public readonly simulator: Simulator;

  constructor(configuration: TenderlyConfiguration) {
    this.configuration = configuration;
    this.api = new ApiClient({ apiKey: configuration.accessKey });

    this.simulator = new Simulator({ api: this.api, configuration });

    this.contracts = new ContractRepository({
      api: this.api, configuration
    });

    this.wallets = new WalletRepository({
      api: this.api, configuration
    });
  }

  public with(configurationOverride: Partial<TenderlyConfiguration>) {
    return new Tenderly({ ...this.configuration, ...configurationOverride });
  }
}