import fs from 'fs';
import { ethers } from 'ethers';
import solc from 'solc';
import path from 'path';

export const deployContract = async () => {
  console.log('Reading source code...');
  const contractSourceCode = fs.readFileSync(
    path.join(__dirname, '..', 'contracts', 'HelloWorld.sol'),
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
      metadata: {
        useLiteralContent: true,
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
  return { address: contract.address, sourceCode: contractSourceCode, compilerSettings };
};
