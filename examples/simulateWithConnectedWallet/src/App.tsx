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

function App() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [amountToSend, setAmountToSend] = useState(0);
  const [addressToSend, setAddressToSend] = useState('');

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
    <div className="flex flex-col gap-y-2 p-3 justify-center items-center">
      <h1>Simulate with connected wallet</h1>
      <div className="p-3 flex flex-col gap-y-2 bg-gray-100 rounded shadow">
        {addresses.length === 0 && (
          <>
            <p>Connect MetaMask to see your connected addresses and simulate a transaction</p>
            <button className="p-3 bg-blue-500 text-white rounded" onClick={requestAccounts}>
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
            <div className="p-3 flex gap-2">
              {addresses.map(address => (
                <div key={address} className="p-3 flex flex-col gap-y-2 rounded shadow bg-gray-50">
                  <p className="">{address}</p>
                  <button
                    className="py-2 px-4 ml-auto bg-green-400 text-white rounded"
                    onClick={() => handleSend(address)}
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
