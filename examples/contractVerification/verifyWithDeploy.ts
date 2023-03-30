import dotenv from 'dotenv';
import { SolidityCompilerVersions } from '../../lib';
import { deployContract } from './scripts/deploy';
import { verifyContract } from './scripts/verifyContract';

dotenv.config();

(async () => {
  console.log('Executing deploy script...');
  const { address, sourceCode, compilerSettings } = await deployContract();

  console.log('Executing verify script...');
  await verifyContract(address, {
    mode: 'private',
    contractToVerify: 'HelloWorld',
    solc: {
      compiler: {
        version: SolidityCompilerVersions.v0_8_19,
        settings: compilerSettings,
      },
      sources: {
        'HelloWorld.sol': {
          name: 'HelloWorld',
          code: sourceCode,
        },
      },
    },
  });
})();
