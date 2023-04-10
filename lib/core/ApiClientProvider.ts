import { ApiClient, ApiVersion } from './ApiClient';

export class ApiClientProvider {
  static instance: ApiClientProvider = null;
  private readonly apiKey: string;
  private readonly apiClients: Record<ApiVersion, ApiClient> | unknown = {};

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }

  getApiClient({ version }: { version: ApiVersion }): ApiClient {
    if (!this.apiClients[version]) {
      this.apiClients[version] = new ApiClient({ version, apiKey: this.apiKey });
    }
    return this.apiClients[version];
  }
}
