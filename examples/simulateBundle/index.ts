/* eslint-disable max-len */
import { Interface, parseEther } from 'ethers';
import * as dotenv from 'dotenv';
import { Network, Tenderly } from '../../lib';
import { TransactionParameters } from '../../lib/simulator';

const fakeWardAddressEOA = '0xe2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2';
const daiOwnerEOA = '0xe58b9ee93700a616b50509c8292977fa7a0f8ce1';
const daiAddressMainnet = '0x6b175474e89094c44da98b954eedeac495271d0f';
const uniswapV3SwapRouterAddressMainnet = '0xe592427a0aece92de3edee1f18e0157c05861564';
const wethAddressMainnet = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

dotenv.config();

(async () => {
  const tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY || '',
    accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
    projectName: process.env.TENDERLY_PROJECT_NAME || '',
    network: Network.MAINNET,
  });

  const simulatedBundle = await tenderly.simulator.simulateBundle({
    blockNumber: 0x103a957,
    transactions: [
      // TX1: Mint 2 DAI for daiOwnerEOA.
      // For minting to happen, we must do a state override so fakeWardAddress EOA is considered a ward for this simulation (see overrides)
      mint2DaiTx(),
      // TX2: daiOwnerEOA approves 1 DAI to uniswapV3SwapRouterAddressMainnet
      approveUniswapV2RouterTx(),
      // TX3: Perform a uniswap swap of 1/3 ETH
      swapSomeDaiForWethTx(),
    ],
    overrides: {
      [daiAddressMainnet]: {
        state: {
          // make DAI think that fakeWardAddress is a ward for minting
          [`wards[${fakeWardAddressEOA}]`]:
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
      },
    },
  });
  const totalGasUsed = simulatedBundle
    .map(simulation => simulation.gasUsed)
    .reduce((total, gasUsed) => total + gasUsed);

  console.log('Total gas used:', totalGasUsed);

  simulatedBundle.forEach((simulation, idx) => {
    console.log(
      `Transaction ${idx} at block ${simulation.blockNumber}`,
      simulation.status ? 'success' : 'failed',
    );
  });
})();

function mint2DaiTx(): TransactionParameters {
  return {
    from: fakeWardAddressEOA,
    to: daiAddressMainnet,
    gas: 0,
    gas_price: '0',
    value: 0,
    //'0x40c10f19000000000000000000000000e58b9ee93700a616b50509c8292977fa7a0f8ce10000000000000000000000000000000000000000000000001bc16d674ec80000',
    input: daiEthersInterface().encodeFunctionData('mint', [daiOwnerEOA, parseEther('2')]),
  };
}

function approveUniswapV2RouterTx(): TransactionParameters {
  return {
    from: daiOwnerEOA,
    to: daiAddressMainnet,
    gas: 0,
    gas_price: '0',
    value: 0,
    input: daiEthersInterface().encodeFunctionData('approve', [
      uniswapV3SwapRouterAddressMainnet,
      parseEther('1'),
    ]),
  };
}

function swapSomeDaiForWethTx(): TransactionParameters {
  return {
    from: daiOwnerEOA,
    to: uniswapV3SwapRouterAddressMainnet,
    gas: 0,
    gas_price: '0',
    value: 0,
    input: uniswapRouterV2EthersInterface().encodeFunctionData('exactInputSingle', [
      {
        tokenIn: daiAddressMainnet,
        tokenOut: wethAddressMainnet,
        fee: '10000',
        recipient: daiOwnerEOA,
        deadline: (1681109951 + 10 * 365 * 24 * 60 * 60 * 1000).toString(),
        amountIn: '33000000000000000',
        amountOutMinimum: '763124874493',
        sqrtPriceLimitX96: '0',
      },
    ]),
  };
}

function daiEthersInterface() {
  // prettier-ignore
  const daiAbi=[
    {constant:false,inputs:[{internalType:'address',name:'src',type:'address',},{internalType:'address',name:'dst',type:'address',},{internalType:'uint256',name:'wad',type:'uint256',},],name:'transferFrom',outputs:[{internalType:'bool',name:'',type:'bool',},],payable:false,stateMutability:'nonpayable',type:'function',},
    {constant:false,inputs:[{internalType:'address',name:'usr',type:'address',},{internalType:'uint256',name:'wad',type:'uint256',},],name:'approve',outputs:[{internalType:'bool',name:'',type:'bool',},],payable:false,stateMutability:'nonpayable',type:'function',},
    {constant:false,inputs:[{internalType:'address',name:'usr',type:'address',},{internalType:'uint256',name:'wad',type:'uint256',},],name:'mint',outputs:[],payable:false,stateMutability:'nonpayable',type:'function',}
  ];

  return new Interface(daiAbi);
}

function uniswapRouterV2EthersInterface() {
  //prettier-ignore
  const swapRouterAbi = [
    { inputs: [ { internalType: 'address', name: '_factory', type: 'address', }, { internalType: 'address', name: '_WETH9', type: 'address', }, ], stateMutability: 'nonpayable', type: 'constructor', },
    { inputs: [], name: 'WETH9', outputs: [ { internalType: 'address', name: '', type: 'address', }, ], stateMutability: 'view', type: 'function', },
    { inputs: [ { components: [ { internalType: 'bytes', name: 'path', type: 'bytes', }, { internalType: 'address', name: 'recipient', type: 'address', }, { internalType: 'uint256', name: 'deadline', type: 'uint256', }, { internalType: 'uint256', name: 'amountIn', type: 'uint256', }, { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256', }, ], internalType: 'struct ISwapRouter.ExactInputParams', name: 'params', type: 'tuple', }, ], name: 'exactInput', outputs: [ { internalType: 'uint256', name: 'amountOut', type: 'uint256', }, ], stateMutability: 'payable', type: 'function', },
    { inputs: [ { components: [ { internalType: 'address', name: 'tokenIn', type: 'address', }, { internalType: 'address', name: 'tokenOut', type: 'address', }, { internalType: 'uint24', name: 'fee', type: 'uint24', }, { internalType: 'address', name: 'recipient', type: 'address', }, { internalType: 'uint256', name: 'deadline', type: 'uint256', }, { internalType: 'uint256', name: 'amountIn', type: 'uint256', }, { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256', }, { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160', }, ], internalType: 'struct ISwapRouter.ExactInputSingleParams', name: 'params', type: 'tuple', }, ], name: 'exactInputSingle', outputs: [ { internalType: 'uint256', name: 'amountOut', type: 'uint256', }, ], stateMutability: 'payable', type: 'function', },
    { inputs: [ { components: [ { internalType: 'bytes', name: 'path', type: 'bytes', }, { internalType: 'address', name: 'recipient', type: 'address', }, { internalType: 'uint256', name: 'deadline', type: 'uint256', }, { internalType: 'uint256', name: 'amountOut', type: 'uint256', }, { internalType: 'uint256', name: 'amountInMaximum', type: 'uint256', }, ], internalType: 'struct ISwapRouter.ExactOutputParams', name: 'params', type: 'tuple', }, ], name: 'exactOutput', outputs: [ { internalType: 'uint256', name: 'amountIn', type: 'uint256', }, ], stateMutability: 'payable', type: 'function', },
    { inputs: [ { components: [ { internalType: 'address', name: 'tokenIn', type: 'address', }, { internalType: 'address', name: 'tokenOut', type: 'address', }, { internalType: 'uint24', name: 'fee', type: 'uint24', }, { internalType: 'address', name: 'recipient', type: 'address', }, { internalType: 'uint256', name: 'deadline', type: 'uint256', }, { internalType: 'uint256', name: 'amountOut', type: 'uint256', }, { internalType: 'uint256', name: 'amountInMaximum', type: 'uint256', }, { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160', }, ], internalType: 'struct ISwapRouter.ExactOutputSingleParams', name: 'params', type: 'tuple', }, ], name: 'exactOutputSingle', outputs: [ { internalType: 'uint256', name: 'amountIn', type: 'uint256', }, ], stateMutability: 'payable', type: 'function', },
    { inputs: [], name: 'factory', outputs: [ { internalType: 'address', name: '', type: 'address', }, ], stateMutability: 'view', type: 'function', },
    { inputs: [ { internalType: 'bytes[]', name: 'data', type: 'bytes[]', }, ], name: 'multicall', outputs: [ { internalType: 'bytes[]', name: 'results', type: 'bytes[]', }, ], stateMutability: 'payable', type: 'function', },
    { inputs: [], name: 'refundETH', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'address', name: 'token', type: 'address', }, { internalType: 'uint256', name: 'value', type: 'uint256', }, { internalType: 'uint256', name: 'deadline', type: 'uint256', }, { internalType: 'uint8', name: 'v', type: 'uint8', }, { internalType: 'bytes32', name: 'r', type: 'bytes32', }, { internalType: 'bytes32', name: 's', type: 'bytes32', }, ], name: 'selfPermit', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'address', name: 'token', type: 'address', }, { internalType: 'uint256', name: 'nonce', type: 'uint256', }, { internalType: 'uint256', name: 'expiry', type: 'uint256', }, { internalType: 'uint8', name: 'v', type: 'uint8', }, { internalType: 'bytes32', name: 'r', type: 'bytes32', }, { internalType: 'bytes32', name: 's', type: 'bytes32', }, ], name: 'selfPermitAllowed', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'address', name: 'token', type: 'address', }, { internalType: 'uint256', name: 'nonce', type: 'uint256', }, { internalType: 'uint256', name: 'expiry', type: 'uint256', }, { internalType: 'uint8', name: 'v', type: 'uint8', }, { internalType: 'bytes32', name: 'r', type: 'bytes32', }, { internalType: 'bytes32', name: 's', type: 'bytes32', }, ], name: 'selfPermitAllowedIfNecessary', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'address', name: 'token', type: 'address', }, { internalType: 'uint256', name: 'value', type: 'uint256', }, { internalType: 'uint256', name: 'deadline', type: 'uint256', }, { internalType: 'uint8', name: 'v', type: 'uint8', }, { internalType: 'bytes32', name: 'r', type: 'bytes32', }, { internalType: 'bytes32', name: 's', type: 'bytes32', }, ], name: 'selfPermitIfNecessary', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'address', name: 'token', type: 'address', }, { internalType: 'uint256', name: 'amountMinimum', type: 'uint256', }, { internalType: 'address', name: 'recipient', type: 'address', }, ], name: 'sweepToken', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'address', name: 'token', type: 'address', }, { internalType: 'uint256', name: 'amountMinimum', type: 'uint256', }, { internalType: 'address', name: 'recipient', type: 'address', }, { internalType: 'uint256', name: 'feeBips', type: 'uint256', }, { internalType: 'address', name: 'feeRecipient', type: 'address', }, ], name: 'sweepTokenWithFee', outputs: [], stateMutability: 'payable', type: 'function', },
    { inputs: [ { internalType: 'int256', name: 'amount0Delta', type: 'int256', }, { internalType: 'int256', name: 'amount1Delta', type: 'int256', }, { internalType: 'bytes', name: '_data', type: 'bytes', }, ], name: 'uniswapV3SwapCallback', outputs: [], stateMutability: 'nonpayable', type: 'function', }, { inputs: [ { internalType: 'uint256', name: 'amountMinimum', type: 'uint256', }, { internalType: 'address', name: 'recipient', type: 'address', }, ], name: 'unwrapWETH9', outputs: [], stateMutability: 'payable', type: 'function', }, { inputs: [ { internalType: 'uint256', name: 'amountMinimum', type: 'uint256', }, { internalType: 'address', name: 'recipient', type: 'address', }, { internalType: 'uint256', name: 'feeBips', type: 'uint256', }, { internalType: 'address', name: 'feeRecipient', type: 'address', }, ], name: 'unwrapWETH9WithFee', outputs: [], stateMutability: 'payable', type: 'function', }, { stateMutability: 'payable', type: 'receive', }
  ];

  return new Interface(swapRouterAbi);
}
