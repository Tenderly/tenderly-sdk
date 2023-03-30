/* eslint-disable */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Tenderly, Network, SolidityCompilerVersions } from '../../lib';

// Load the environment variables from the .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  projectName: process.env.TENDERLY_PROJECT_NAME,
  accountName: process.env.TENDERLY_ACCOUNT_NAME,
  network: Network.SEPOLIA,
});

(async () => {
  console.log("Reading solc JSON from 'contracts/HelloWorld.solc-output.json'");
  const solcOutput = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'contracts', 'HelloWorld.solc-output.json'), 'utf-8'),
  );

  console.log("Preparing paylod for 'tenderly.contracts.verify' method");
  const metadata = JSON.parse(solcOutput.contracts['HelloWorld.sol'].HelloWorld.metadata);

  const compiler = {
    version: metadata.compiler.version,
    settings: metadata.settings,
  };

  const code = metadata.sources['HelloWorld.sol'].content;

  const verificationPayload = {
    mode: 'private',
    contractToVerify: 'HelloWorld',
    solc: {
      compiler,
      sources: {
        'HelloWorld.sol': {
          name: 'HelloWorld',
          code,
        },
      },
    },
  } as const;

  console.log('Verifying contract on Tenderly...');
  const verificationResult = await tenderly.contracts.verify(
    '0x9202ce0f83c52dcf4d7998e0e1e1be453ebcaaff',
    verificationPayload,
  );

  console.log('Verification result:\n', verificationResult);

  console.log('Adding contract to Tenderly...');
  const addContractResult = await tenderly.contracts.add(
    '0x9202ce0f83c52dcf4d7998e0e1e1be453ebcaaff',
  );

  console.log('Add contract result:\n', addContractResult);
})();
