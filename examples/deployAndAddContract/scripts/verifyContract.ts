import { Network, Tenderly, VerificationRequest } from '../../../lib';

export const verifyContract = async (address: string, verificationPayload: VerificationRequest) => {
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
    const verificationResult = await tenderly.contracts.verify(address, verificationPayload);

    console.log(
      'Verification result:\n',
      (verificationResult.data as { results: unknown }).results,
    );

    // Add the contract to the Tenderly project
    const addContractResult = await tenderly.contracts.add(address, {
      displayName: 'HelloWorld',
    });

    console.log('Contract from project:\n', addContractResult);
  } catch (e) {
    console.log('Error verifying contract:');
  }
};
