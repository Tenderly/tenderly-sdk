import axios, { AxiosInstance, AxiosResponse } from "axios";
import { TENDERLY_API_BASE_URL, TENDERLY_SDK_VERSION } from "../constants";

export class ApiClient {
  private readonly api: AxiosInstance;

  constructor({ apiKey }: { apiKey: string }) {
    this.api = axios.create({
      baseURL: `${TENDERLY_API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': apiKey,
        'User-Agent': `@tenderly/sdk-js/${TENDERLY_SDK_VERSION}`,
      },
    }
    );
  }

  public get<ResponseModel>(path: string, params?: Record<string, string>): Promise<{ data: ResponseModel }> {
    return this.api.get(path.replace(/\s/g, ''), { params });
  }

  /**
   * 
   * @param path url path to the resource
   * @param data data to be sent to the server
   * @returns Promise with the response data
   */
  public post<RequestModel, ResponseModel>(
    path: string,
    data?: RequestModel,
  ): Promise<{ data: ResponseModel }> {
    return this.api.post(path.replace(/\s/g, ''), data);
  }

  public async put(
    path: string, data?: Record<string, string>,
    params?: Record<string, string>
  ): Promise<AxiosResponse> {
    return this.api.put(path.replace(/\s/g, ''), data, { params });
  }

  public async delete(path: string, data?: Record<string, unknown>): Promise<AxiosResponse> {
    return this.api.delete(path.replace(/\s/g, ''), { data });
  }
}
