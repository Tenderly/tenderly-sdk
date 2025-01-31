import { ApiClient, ApiVersion } from './ApiClient';
import { EmptyObject } from '../types';

export class ApiClientProvider {
  static instance: ApiClientProvider;
  private readonly apiKey: string;
  private readonly apiClients: Record<ApiVersion, ApiClient> | EmptyObject = {};

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
    this.validateApiKey();
  }

  getApiClient({ version }: { version: ApiVersion }): ApiClient {
    if (!this.apiClients[version]) {
      this.apiClients[version] = new ApiClient({ version, apiKey: this.apiKey });
    }
    return this.apiClients[version];
  }

  /**
   * Validates the API key format
   * @throws Error if API key is invalid
   */
  private validateApiKey(): void {
    if (!this.apiKey || typeof this.apiKey !== 'string') {
      throw new Error('Invalid API key: API key must be a non-empty string');
    }
    if (this.apiKey.length < 32) {
      throw new Error('Invalid API key: API key length must be at least 32 characters');
    }
  }

  /**
   * Creates or returns a singleton instance of ApiClientProvider
   */
  public static getInstance(config: { apiKey: string }): ApiClientProvider {
    if (!ApiClientProvider.instance) {
      ApiClientProvider.instance = new ApiClientProvider(config);
    }
    return ApiClientProvider.instance;
  }

  /**
   * Clears all existing API client instances
   */
  public clearClients(): void {
    Object.keys(this.apiClients).forEach((version) => {
      delete this.apiClients[version as ApiVersion];
    });
  }

  /**
   * Returns whether a client exists for the specified version
   */
  public hasClient(version: ApiVersion): boolean {
    return !!this.apiClients[version];
  }
}
