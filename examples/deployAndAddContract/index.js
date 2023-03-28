/* eslint-disable */
const fs = require('fs');
const { ethers } = require('ethers');
const solc = require('solc');
const path = require('path');
const dotenv = require('dotenv');
const { Tenderly, Network, SolidityCompilerVersions } = require('@tenderly/sdk');

// Load the environment variables from the .env file
dotenv.config();

(async function main() {
  console.log('Reading source code...');
  const contractSourceCode = fs.readFileSync(
    path.join(__dirname, 'contracts', 'HelloWorld.sol'),
    'utf-8',
  );

  const compilerSettings = {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  };

  const input = {
    language: 'Solidity',
    sources: {
      'HelloWorld.sol': {
        content: contractSourceCode,
      },
    },
    settings: {
      ...compilerSettings,
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  console.log('Compiling contract...');
  const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));

  console.log('Contract source code:\n', contractSourceCode);

  // Get the compiled bytecode and ABI
  const bytecode = compiledContract.contracts['HelloWorld.sol'].HelloWorld.evm.bytecode.object;
  const abi = compiledContract.contracts['HelloWorld.sol'].HelloWorld.abi;

  // Specify the private key of the Ethereum account to deploy the contract from
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  // Specify the RPC endpoint of the Sepolia test network
  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.gateway.tenderly.co/${process.env.GATEWAY_KEY}`,
  );

  // Create a new ethers.Wallet object from the private key
  const wallet = new ethers.Wallet(privateKey, provider);

  // Create a new ethers.ContractFactory object with the signer set to the wallet
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log('Getting transaction count for nonce...');
  // Get new nonce, because it doesn't work sometimes
  const nonce = await wallet.getTransactionCount();

  console.log('Deploying contract...');
  // Deploy the contract to the Sepolia test network
  const contract = await contractFactory.deploy('Hello World', { nonce });

  // write code to show how long it took to mine the contract
  const now = Date.now();

  console.log('Contract deployed. Waiting for the contract to be mined...');

  // Wait for the contract to be mined
  await contract.deployed();

  console.log(`Contract mined in ${Date.now() - now}ms`);

  // Print the contract address
  console.log('Contract address:', contract.address);

  // Create Tenderly instance
  const tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.SEPOLIA,
  });

  try {
    console.log('Verifying contract...');
    // Verify the contract on Tenderly
    const verificationResult = await tenderly.contracts.verify(contract.address, {
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
            code: contractSourceCode,
          },
        },
      },
    });

    console.log('Verification result:\n', verificationResult.data.results);

    // Add the contract to the Tenderly project
    const addContractResult = await tenderly.contracts.add(contract.address, {
      displayName: 'HelloWorld',
    });

    console.log('Contract from project:\n', addContractResult);
  } catch (e) {
    console.log('Error verifying contract:');
  }
})();
