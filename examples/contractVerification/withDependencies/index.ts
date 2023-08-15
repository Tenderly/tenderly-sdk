import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { Tenderly, Network, Web3Address, getEnvironmentVariables } from '../../../lib';

dotenv.config();

const myTokenAddress = `0x1a273A64C89CC45aBa798B1bC31B416A199Be3b3`.toLowerCase() as Web3Address;
const ROOT_FOLDER = `examples/contractVerification/withDependencies/contracts`;

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: getEnvironmentVariables().TENDERLY_ACCESS_KEY,
      accountName: getEnvironmentVariables().TENDERLY_ACCOUNT_NAME,
      projectName: getEnvironmentVariables().TENDERLY_PROJECT_NAME,
      network: Network.SEPOLIA,
    });

    const result = await tenderly.contracts.verify(myTokenAddress, {
      config: {
        mode: `public`,
      },
      contractToVerify: `${ROOT_FOLDER}/MyToken.sol:MyToken`,
      solc: {
        version: `v0.8.19`,
        sources: {
          [`${ROOT_FOLDER}/MyToken.sol`]: {
            content: readFileSync(`${ROOT_FOLDER}/MyToken.sol`, `utf8`),
          },
          [`@openzeppelin/contracts/token/ERC20/ERC20.sol`]: {
            content: readFileSync(`${ROOT_FOLDER}/ERC20.sol`, `utf8`),
          },
          [`@openzeppelin/contracts/token/ERC20/IERC20.sol`]: {
            content: readFileSync(`${ROOT_FOLDER}/IERC20.sol`, `utf8`),
          },
          [`@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol`]: {
            content: readFileSync(`${ROOT_FOLDER}/IERC20Metadata.sol`, `utf8`),
          },
          [`@openzeppelin/contracts/utils/Context.sol`]: {
            content: readFileSync(`${ROOT_FOLDER}/Context.sol`, `utf8`),
          },
        },
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    });

    console.log(`Result:`, result);
  } catch (error) {
    console.error(error);
  }
})();
