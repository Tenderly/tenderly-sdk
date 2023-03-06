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

    this.contracts = {
      ...{
        verify: async (address: string, verificationRequest: VerificationRequest) => {
          try {
            const result = await this.api.post(
              `account/${this.configuration.accountName}/project/${this.configuration.projectName}/contracts`, {
              config: {
                optimization_count:
                  verificationRequest.solc.compiler.settings.optimizer.enabled
                    ? verificationRequest.solc.compiler.settings.optimizer.runs
                    : null,

              }, contracts: Object.keys(verificationRequest.solc.sources).map((path: string) => ({
                contractName: verificationRequest.solc.sources[path].name,
                source: verificationRequest.solc.sources[path].source,
                sourcePath: path,
                networks: {
                  [this.configuration.network]: { address: address, links: {} }
                },
                compiler: {
                  name: 'solc',
                  version: verificationRequest.solc.compiler.version,
                }
              }))
            });

            return result;
          } catch (error) {
            console.error('Error: ', error);
            throw error;
          }
        }
      }, ...new ContractRepository({
        api: this.api, configuration
      })
    };

    this.wallets = new WalletRepository({
      api: this.api, configuration
    });
  }

  public with(configurationOverride: Partial<TenderlyConfiguration>) {
    return new Tenderly({ ...this.configuration, ...configurationOverride });
  }
}