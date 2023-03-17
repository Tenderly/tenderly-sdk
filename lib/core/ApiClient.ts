import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TENDERLY_API_BASE_URL, TENDERLY_SDK_VERSION } from '../constants';

export class ApiClient {
  private readonly api: AxiosInstance;

  /**
   * @param apiKey API key to be used for the requests. 
   * Can be generated in the Tenderly dashboard: https://dashboard.tenderly.co/account/authorization 
   */
  constructor({ apiKey }: { apiKey: string }) {
    this.api = axios.create({
      baseURL: `${TENDERLY_API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': apiKey,
        'User-Agent': `@tenderly/sdk-js/${TENDERLY_SDK_VERSION}`,
      },
    });
  }

  /**
   * 
   * @param path url path to the resource
   * @param params url query params
   * @returns Promise with AxiosResponse that
   * contains the response data model with a type of a given generic parameter 
   */
  public get<ResponseModel>(path: string, params?: Record<string, string>) {
    return this.api.get<ResponseModel>(path.replace(/\s/g, ''), { params });
  }

  /**
   *
   * @param path url path to the resource
   * @param data data to be sent to the server. Type of data expected can be specified with a second generic parameter
   * @returns Promise with AxiosResponse that
   * contains the response data model with a type of a second generic parameter 
   */
  public post<RequestModel, ResponseModel>(path: string, data?: RequestModel) {
    return this.api.post<ResponseModel>(path.replace(/\s/g, ''), data);
  }

  /**
   * 
   * @param path url path to the resource
   * @param data data to be sent to the server in order to update the model.
   * Type of data expected can be specified with a second generic parameter
   * @param params url query params
   * @returns Promise with AxiosResponse that contains the response data model with a type of a second generic parameter
   */
  public async put<RequestModel, ResponseModel>(
    path: string,
    data?: RequestModel,
    params?: Record<string, string>,
  ) {
    return this.api.put<ResponseModel>(path.replace(/\s/g, ''), data, { params });
  }

  /**
   * @param path url path to the resource
   * @param data data to be sent to the server in order to remove the model.
   * @returns AxiosResponse
   */
  public async delete(path: string, data?: Record<string, unknown>): Promise<AxiosResponse> {
    return this.api.delete(path.replace(/\s/g, ''), { data });
  }
}
