/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers } from 'ethers';
import { useState } from 'react';
import { Network, Tenderly } from '../../../lib';

console.log(import.meta.env.VITE_TENDERLY_ACCESS_KEY);
const tenderlyInstance = new Tenderly({
  accessKey: import.meta.env.VITE_TENDERLY_ACCESS_KEY,
  projectName: import.meta.env.VITE_TENDERLY_PROJECT,
  accountName: import.meta.env.VITE_TENDERLY_ACCOUNT_NAME,
  network: Network.MAINNET,
});

// utility types not relevant to logic
type Unwrap<T> = T extends Promise<infer K> ? K : T;

function App() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [amountToSend, setAmountToSend] = useState(0);
  const [addressToSend, setAddressToSend] = useState('');
  const [simulationResult, setSimulationResult] = useState<Unwrap<
    ReturnType<typeof tenderlyInstance.simulator.simulateTransaction>
  > | null>(null);

  if (!window.ethereum) {
    return (
      <div>
        <h1>Simulate with connected wallet</h1>
        <p>Install MetaMask to use this example</p>
      </div>
    );
  }

  const handleSend = async (address: string) => {
    if (!addressToSend || !amountToSend || !window.ethereum?.request) {
      return;
    }

    try {
      const override = {
        [address]: {
          balance: ethers.utils.hexValue(amountToSend * 2),
        },
      };

      console.log(override);
      const simulationResult = await tenderlyInstance.simulator.simulateTransaction({
        transaction: {
          from: address,
          to: addressToSend,
          input: '0x',
          value: ethers.utils.hexValue(amountToSend),
        },
      });

      console.log(simulationResult);
      setSimulationResult(simulationResult);
    } catch (error) {
      if ((error as { code: number })?.code === 4001) {
        alert('Transaction rejected');
        return;
      }
      throw error;
    }
  };

  const requestAccounts = async () => {
    const addresses = await window.ethereum?.request?.({
      method: 'eth_requestAccounts',
    });

    setAddresses(addresses);
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 gap-y-2">
      <h1>Simulate with connected wallet</h1>
      <div className="flex flex-col p-3 bg-gray-100 rounded shadow gap-y-2">
        {addresses.length === 0 && (
          <>
            <p>Connect MetaMask to see your connected addresses and simulate a transaction</p>
            <button className="p-3 text-white bg-blue-500 rounded" onClick={requestAccounts}>
              Connect MetaMask
            </button>
          </>
        )}
        {addresses.length > 0 && (
          <>
            <div>
              <label htmlFor="amountToSend">Amount to send </label>
              <input
                id="amountToSend"
                type="number"
                className="border border-gray-300 rounded"
                value={amountToSend}
                onChange={e => setAmountToSend(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="addressToSend">Address to send </label>
              <input
                id="addressToSend"
                type="text"
                className="border border-gray-300 rounded"
                value={addressToSend}
                onChange={e => setAddressToSend(e.target.value)}
              />
            </div>
            <h2>Connected addresses</h2>
            <div className="flex gap-2 p-3">
              {addresses.map(address => (
                <div key={address} className="flex flex-col p-3 rounded shadow gap-y-2 bg-gray-50">
                  <p className="">{address}</p>
                  <button
                    className="px-4 py-2 ml-auto text-white bg-green-400 rounded"
                    onClick={() => handleSend(address)}
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {simulationResult && (
          <>
            <h2>Simulation Result:</h2>
            <pre className="p-3 text-black bg-gray-300 border border-black border-solid rounded shadow-inner">
              {JSON.stringify(simulationResult, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
