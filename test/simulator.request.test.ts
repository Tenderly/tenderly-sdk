import { Simulator } from '../lib/executors/Simulator';
import { Web3Address, Network } from '../lib';

const sender = '0x1111111111111111111111111111111111111111' as Web3Address;
const recipient = '0x2222222222222222222222222222222222222222' as Web3Address;

function makeSimulator() {
  return new Simulator({
    apiProvider: {
      getApiClient: () => ({ post: jest.fn() }),
    } as any,
    configuration: {
      accessKey: 'test',
      accountName: 'account',
      projectName: 'project',
      network: Network.SEPOLIA,
    },
  });
}

describe('Simulator request builders', () => {
  it('includes save flags in simple simulation requests', () => {
    const simulator = makeSimulator() as any;

    const request = simulator.buildSimpleSimulationRequest(
      {
        from: sender,
        to: recipient,
        gas: 21000,
        gas_price: '1',
        value: '0',
        input: '0x',
        save: true,
        save_if_fails: true,
      },
      123,
    );

    expect(request.call_args.save).toBe(true);
    expect(request.call_args.save_if_fails).toBe(true);
  });

  it('includes save flags in bundle simulation requests', () => {
    const simulator = makeSimulator() as any;

    const request = simulator.buildSimulationBundleRequest(
      [
        {
          from: sender,
          to: recipient,
          gas: 21000,
          gas_price: '1',
          value: '0',
          input: '0x',
          save: false,
          save_if_fails: true,
        },
      ],
      123,
    );

    expect(request.call_args[0].save).toBe(false);
    expect(request.call_args[0].save_if_fails).toBe(true);
  });
});
