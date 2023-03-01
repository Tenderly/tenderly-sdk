import { Network, TenderlyConfiguration } from "../../models";
import { ContractResponse } from "./Contract.response";
import { Repository } from "../Repository";
import { ApiClient } from "../../core/ApiClient";
import { ContractRequest } from "./Contract.request";
import { Contract } from "./Contract.model";

function mapContractResponseToContractModel(contractResponse: ContractResponse): Contract {
  return ({
    address: contractResponse.contract.address,
    network: Number.parseInt(contractResponse.contract.network_id) as unknown as Network,
  });
}

function mapContractModelToContractRequest(contract: Contract): ContractRequest {
  return ({
    address: contract.address,
    network_id: `${contract.network}`,
  });
}

export class ContractRepository implements Repository<Contract> {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient, configuration: TenderlyConfiguration }) {
    this.api = api;
    this.configuration = configuration;
  }

  get = async (address: string) => {

    try {
      const { data } = await this.api.get<ContractResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contract/${this.configuration.network}/${address}
    `
      );

      return (mapContractResponseToContractModel(data));
    }
    catch (error) {
      console.error('Error: ', error);
    }

  };

  add = async (address: string, contractData?: Contract) => {
    try {
      const { data } = await this.api.post<ContractRequest, ContractResponse>(`
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /address
      `, mapContractModelToContractRequest({
        address,
        network: this.configuration.network
        , ...contractData
      })
      );

      return (mapContractResponseToContractModel(data));
    }
    catch (error) {
      console.error('Error: ', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove = (address: string) =>
    Promise.resolve();
  update = (address: string, data: Contract) =>
    new Promise((resolve: (x: Contract) => void) => { resolve(({ address: address, ...data } as Contract)); });
  getBy = (queryObject: Partial<Contract>) =>
    new Promise((resolve: (x: Contract) => void) => { resolve((queryObject as Contract)); });
}