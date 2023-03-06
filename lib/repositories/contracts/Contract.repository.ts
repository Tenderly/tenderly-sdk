import { Network, TenderlyConfiguration, VerificationRequest } from '../../models';
import { ContractResponse } from './Contract.response';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import { ContractRequest } from './Contract.request';
import { Contract } from './Contract.model';
import { UpdateContractRequest } from './UpdateContract.request';
import { GetByParams } from './Contract.request';

function mapContractResponseToContractModel(contractResponse: ContractResponse): Contract {
  const retVal: Contract = {
    address: contractResponse.contract.address,
    network: Number.parseInt(contractResponse.contract.network_id) as unknown as Network,
  };

  if (contractResponse.display_name) {
    retVal.displayName = contractResponse.display_name;
  }

  if (contractResponse.tags) {
    retVal.tags = contractResponse.tags.map(({ tag }) => tag);
  }

  return retVal;
}

function mapContractModelToContractRequest(contract: Contract): ContractRequest {
  return {
    address: contract.address,
    network_id: `${contract.network}`,
  };
}

function filterByDisplayName(contract: ContractResponse, displayNames: string | string[]) {
  if (!contract.display_name) {
    return false;
  }

  return Array.isArray(displayNames)
    ? displayNames.some(name => contract.display_name?.includes(name))
    : contract.display_name.includes(displayNames);
}

function filterByTags(contract: ContractResponse, tags: string | string[]) {
  if (!contract.tags) {
    return false;
  }

  return Array.isArray(tags)
    ? tags.some(tagFromFilter => contract.tags.some(({ tag }) => tag === tagFromFilter))
    : contract.tags.some(({ tag }) => tag === tags);
}

function filterByNetwork(contract: ContractResponse, networks: Network | Network[]) {
  return Array.isArray(networks)
    ? networks.some(net => +contract.contract.network_id === net)
    : +contract.contract.network_id === networks;
}

export class ContractRepository implements Repository<Contract> {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient; configuration: TenderlyConfiguration }) {
    this.api = api;
    this.configuration = configuration;
  }

  get = async (address: string) => {
    try {
      const { data } = await this.api.get<ContractResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contract/${this.configuration.network}/${address}
    `);

      return mapContractResponseToContractModel(data);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  add = async (address: string, contractData?: Omit<Contract, 'address'>) => {
    try {
      const { data } = await this.api.post<ContractRequest, ContractResponse>(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /address
      `,
        mapContractModelToContractRequest({
          address,
          network: this.configuration.network,
          ...contractData,
        }),
      );

      return mapContractResponseToContractModel(data);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove = async (address: string) => {
    try {
      await this.api.delete(
        `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /contract/${this.configuration.network}/${address}
      `,
      );
    } catch (error) {
      console.error('Error: ', error);
    }
  };
  update = async (address: string, payload: UpdateContractRequest) => {
    try {
      let promiseArray = payload.appendTags?.map(tag =>
        this.api.post(
          `
          /account/${this.configuration.accountName}
          /project/${this.configuration.projectName}
          /tag
        `,
          {
            contract_ids: [`eth:${this.configuration.network}:${address}`],
            tag,
          },
        ),
      );

      promiseArray ||= [];

      if (payload.displayName) {
        promiseArray.push(
          this.api.post(
            `
            /account/${this.configuration.accountName}
            /project/${this.configuration.projectName}
            /contract/${this.configuration.network}/${address}
            /rename
          `,
            { display_name: payload.displayName },
          ),
        );
      }

      await Promise.all(promiseArray);

      return this.get(address);
    } catch (error) {
      console.error('Error: ', error);
    }
  };
  getBy = async (queryObject: GetByParams = {}) => {
    const contracts = await this.api.get<ContractResponse[]>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts
    `);

    const pipeline = [];

    if (queryObject.tags) {
      pipeline.push(contract => filterByTags(contract, queryObject.tags));
    }

    if (queryObject.displayName) {
      pipeline.push(contract => filterByDisplayName(contract, queryObject.displayName));
    }

    if (queryObject.network) {
      pipeline.push(contract => filterByNetwork(contract, queryObject.network));
    }

    return contracts.data
      .filter(contract => pipeline.every(fn => fn(contract)))
      .map(mapContractResponseToContractModel);
  };

  async verify(address: string, verificationRequest: VerificationRequest) {
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
  }
}
