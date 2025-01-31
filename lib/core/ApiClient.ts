import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { TENDERLY_API_BASE_URL } from '../constants';
import { TENDERLY_SDK_VERSION } from '../sdkVersion';

export type ApiVersion = 'v1' | 'v2';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private readonly api: AxiosInstance;

  /**
   * @param apiKey API key to be used for the requests.
   * Can be generated in the Tenderly dashboard: https://dashboard.tenderly.co/account/authorization
   * @param version API version to be used for the requests. Defaults to 'v1'
   */
  constructor({ apiKey, version = 'v1' }: { apiKey: string; version?: ApiVersion }) {
    this.api = axios.create({
      baseURL: `${TENDERLY_API_BASE_URL}/api/${version}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': apiKey,
        'X-User-Agent': `@tenderly/sdk-js/${TENDERLY_SDK_VERSION}`,
      },
    });

    this.setupInterceptors();
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new ApiError(
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data?.code,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError('No response received from server', undefined, 'NO_RESPONSE');
    } else {
      // Something happened in setting up the request
      throw new ApiError(error.message, undefined, 'REQUEST_SETUP_ERROR');
    }
  }

  private setupInterceptors() {
    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );

    // Request interceptor for logging or modifying requests
    this.api.interceptors.request.use(
      (config) => {
        // You could add request logging here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * @param path url path to the resource
   * @param params url query params
   * @returns Promise with response data of type ResponseModel
   */
  public async get<ResponseModel>(
    path: string,
    params?: Record<string, string | string[]>
  ): Promise<ResponseModel> {
    const response = await this.api.get<ResponseModel>(path.replace(/\s/g, ''), { params });
    return response.data;
  }

  /**
   * @param path url path to the resource
   * @param data data to be sent to the server
   * @returns Promise with response data of type ResponseModel
   */
  public async post<RequestModel, ResponseModel>(
    path: string,
    data?: RequestModel
  ): Promise<ResponseModel> {
    const response = await this.api.post<ResponseModel>(path.replace(/\s/g, ''), data);
    return response.data;
  }

  /**
   * @param path url path to the resource
   * @param data data to be sent to the server
   * @param params url query params
   * @returns Promise with response data of type ResponseModel
   */
  public async put<RequestModel, ResponseModel>(
    path: string,
    data?: RequestModel,
    params?: Record<string, string>
  ): Promise<ResponseModel> {
    const response = await this.api.put<ResponseModel>(path.replace(/\s/g, ''), data, { params });
    return response.data;
  }

  /**
   * @param path url path to the resource
   * @param data data to be sent to the server
   * @returns Promise with void
   */
  public async delete(path: string, data?: Record<string, unknown>): Promise<void> {
    await this.api.delete(path.replace(/\s/g, ''), { data });
  }
}
