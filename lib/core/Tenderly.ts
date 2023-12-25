import { TenderlyConfiguration } from '../types';
import { WalletRepository, ContractRepository } from '../repositories';
import { Simulator } from '../executors';
import { VerificationRequest } from '../repositories/contracts/contracts.types';
import { ApiClientProvider } from './ApiClientProvider';
import { InvalidArgumentsError } from '../errors';

/**
 * The main class of the Tenderly SDK
 * Instantiate this class with your config, and you're ready to go
 * @example
 * const tenderly = new Tenderly({
 *   accountName: 'my-account',
 *   projectName: 'my-project',
 *   accessKey: 'my-access-key',
 *   network: Network.MAINNET,
 * })
 */
export class Tenderly {
  public readonly configuration: TenderlyConfiguration;
  // public readonly api: ApiClient;

  /**
   * Contract repository - used for managing contracts on your project
   */
  public readonly contracts: ContractRepository & {
    verify: (address: string, verificationRequest: VerificationRequest) => Promise<unknown>;
  };

  /**
   * Wallet repository - used for managing wallets on your project
   */
  public readonly wallets: WalletRepository;

  /**
   * Simulator - used for simulating transactions
   */
  public readonly simulator: Simulator;

  private readonly apiClientProvider: ApiClientProvider;

  /**
   * The main class of the Tenderly SDK
   * Instantiate this class with your config, and you're ready to go
   * @example
   * const tenderly = new Tenderly({
   *   accountName: 'my-account',
   *   projectName: 'my-project',
   *   accessKey: 'my-access-key',
   *   network: Network.MAINNET,
   * })
   */
  constructor(configuration: TenderlyConfiguration) {
    this.checkConfiguration(configuration);

    this.configuration = configuration;
    this.apiClientProvider = new ApiClientProvider({ apiKey: configuration.accessKey });

    this.simulator = new Simulator({ apiProvider: this.apiClientProvider, configuration });
    this.contracts = new ContractRepository({ apiProvider: this.apiClientProvider, configuration });
    this.wallets = new WalletRepository({ apiProvider: this.apiClientProvider, configuration });
  }

  /**
   * Create a new Tenderly instance with the provided configuration override
   * @param configurationOverride - The configuration override
   * @returns The new Tenderly instance
   * @example
   * const tenderly = new Tenderly({
   *  accountName: 'my-account',
   *  projectName: 'my-project',
   * );
   */
  public with(configurationOverride: Partial<TenderlyConfiguration>) {
    return new Tenderly({ ...this.configuration, ...configurationOverride });
  }

  checkConfiguration(configuration: TenderlyConfiguration) {
    if (!configuration.accessKey) {
      throw new InvalidArgumentsError('Missing access key.');
    }
    if (!configuration.accountName) {
      throw new InvalidArgumentsError('Missing account name.');
    }
    if (!configuration.projectName) {
      throw new InvalidArgumentsError('Missing project name.');
    }
    if (!configuration.network) {
      throw new InvalidArgumentsError('Missing network.');
    }
  }
}
