import { TenderlyConfiguration } from '../types';
import { ApiClient } from './ApiClient';
import { WalletRepository, ContractRepository } from '../repositories';
import { Simulator } from '../executors';
import { VerificationRequest } from '../repositories/contracts/contracts.types';

/**
 * The main class of the Tenderly SDK
 * Instantiate this class with your config and you're ready to go
 * @example
 * const tenderly = new Tenderly({
 *   accountName: 'my-account',
 *   projectName: 'my-project',
 *   accessKey: 'my-access-key',
 *   network: Network.Mainnet,
 * })
 */
export class Tenderly {
  public readonly configuration: TenderlyConfiguration;
  public readonly api: ApiClient;

  /**
   * Contract repository - used for managing contracts on your project
   */
  public readonly contracts: ContractRepository & {
    verify: (address: string, verificationRequest: VerificationRequest) => Promise<any>;
  };

  /**
   * Wallet repository - used for managing wallets on your project
   */
  public readonly wallets: WalletRepository;

  /**
   * Simulator - used for simulating transactions
   */
  public readonly simulator: Simulator;

  /**
   * The main class of the Tenderly SDK
   * Instantiate this class with your config and you're ready to go
   * @example
   * const tenderly = new Tenderly({
   *   accountName: 'my-account',
   *   projectName: 'my-project',
   *   accessKey: 'my-access-key',
   *   network: Network.Mainnet,
   * })
   */
  constructor(configuration: TenderlyConfiguration) {
    this.configuration = configuration;
    this.api = new ApiClient({ apiKey: configuration.accessKey });

    this.simulator = new Simulator({ api: this.api, configuration });

    this.contracts = new ContractRepository({
      api: this.api,
      configuration,
    });

    this.wallets = new WalletRepository({
      api: this.api,
      configuration,
    });
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
}
