import dotenv from 'dotenv';
import { Tenderly, Network, Web3Address } from '../../../lib';
import { readFileSync } from 'fs';

dotenv.config();

const myTokenAddress = '0x1a273A64C89CC45aBa798B1bC31B416A199Be3b3'.toLowerCase() as Web3Address;

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: process.env.TENDERLY_ACCESS_KEY || '',
      accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
      projectName: process.env.TENDERLY_PROJECT_NAME || '',
      network: Network.SEPOLIA,
    });

    const result = await tenderly.contracts.verify(myTokenAddress, {
      config: {
        mode: 'public',
      },
      contractToVerify: `examples/contractVerification/withDependencies/contracts/MyToken.sol:MyToken`,
      solc: {
        version: 'v0.8.19',
        sources: {
          'examples/contractVerification/withDependencies/contracts/MyToken.sol': {
            content: readFileSync(
              'examples/contractVerification/withDependencies/contracts/MyToken.sol',
              'utf8',
            ),
          },
          '@openzeppelin/contracts/token/ERC20/ERC20.sol': {
            content: readFileSync(
              'examples/contractVerification/withDependencies/contracts/ERC20.sol',
              'utf8',
            ),
          },
          '@openzeppelin/contracts/token/ERC20/IERC20.sol': {
            content: readFileSync(
              'examples/contractVerification/withDependencies/contracts/IERC20.sol',
              'utf8',
            ),
          },
          '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol': {
            content: readFileSync(
              'examples/contractVerification/withDependencies/contracts/IERC20Metadata.sol',
              'utf8',
            ),
          },
          '@openzeppelin/contracts/utils/Context.sol': {
            content: readFileSync(
              'examples/contractVerification/withDependencies/contracts/Context.sol',
              'utf8',
            ),
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

    console.log('Result:', result);
  } catch (error) {
    console.error(error);
  }
})();
