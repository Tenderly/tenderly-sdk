import { Network, TenderlyConfiguration, VerificationRequest } from '../../models';
import { ContractResponse } from './Contract.response';
import { Repository } from '../Repository';
import { ApiClient } from '../../core/ApiClient';
import { ContractRequest } from './Contract.request';
import { Contract } from './Contract.model';
import { UpdateContractRequest } from './UpdateContract.request';
import { GetByParams } from './Contract.request';
import { filterEntities } from '../../filters';
import { contractsOrWalletsFilterMap } from '../../filters/contractsAndWallets';

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
    display_name: contract.displayName,
  };
}

export class ContractRepository implements Repository<Contract> {
  api: ApiClient;
  configuration: TenderlyConfiguration;

  constructor({ api, configuration }: { api: ApiClient; configuration: TenderlyConfiguration }) {
    this.api = api;
    this.configuration = configuration;
  }

  get = async (address: string) => {
    const { data } = await this.api.get<ContractResponse>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contract/${this.configuration.network}/${address}
    `);

    return mapContractResponseToContractModel(data);
  };

  add = async (address: string, contractData: Partial<Omit<Contract, 'address'>> = {}) => {
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
  };

  remove = async (address: string) => {
    await this.api.delete(
      `
        /account/${this.configuration.accountName}
        /project/${this.configuration.projectName}
        /contract/${this.configuration.network}/${address}
      `,
    );
  };

  update = async (address: string, payload: UpdateContractRequest) => {
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
  };

  getBy = async (queryObject: GetByParams = {}) => {
    const contracts = await this.api.get<ContractResponse[]>(`
      /account/${this.configuration.accountName}
      /project/${this.configuration.projectName}
      /contracts
    `);

    const retVal = filterEntities<ContractResponse>(
      contracts.data,
      queryObject,
      contractsOrWalletsFilterMap,
    ).map(mapContractResponseToContractModel);

    return retVal;
  };

  // There is a newer version of this route that we can use
  async verify(address: string, verificationRequest: VerificationRequest) {
    const result = await this.api.post(
      `account/${this.configuration.accountName}/project/${this.configuration.projectName}/contracts`,
      {
        config: {
          optimization_count: verificationRequest.solc.compiler.settings.optimizer.enabled
            ? verificationRequest.solc.compiler.settings.optimizer.runs
            : null,
        },
        contracts: Object.keys(verificationRequest.solc.sources).map((path: string) => ({
          contractName: verificationRequest.solc.sources[path].name,
          source: verificationRequest.solc.sources[path].source,
          sourcePath: path,
          networks: {
            [this.configuration.network]: { address: address, links: {} },
          },
          compiler: {
            name: 'solc',
            version: verificationRequest.solc.compiler.version,
          },
        })),
      },
    );

    return result;
  }
}
