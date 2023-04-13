### **Simulate bundle: mint DAI, approve and perform a Uniswap Swap**

This example shows simulation of doing a Uniswap swap. We'll show the simulation outcome: the execution status of simulated transactions, and calculate the total gas used.

Here are the transactions needed to achieve this:
- Simulate minting of 2 DAI so the swapper has some assets to swap. Alternatively, if you have DAI, you can skip this and just do transaction 2.
- Approve UniswapV3Router to use DAI.
- Do the swap. Call UniswapV2Router.exactInputSingle to perform the swap.

The 1st simulation (minting 2 DAI) is there to avoid working with actual assets. For it to run successfully, the sender needs to be a ward of DAI stablecoin. Since most of us aren't, you'll use the State Overrides to "become a ward" within the context of the Bundled Simulation, which is achieved by specifying `overrides` to the SDK.

You can find a more detailed explanation in [Tenderly docs](https://docs.tenderly.co/tenderly-sdk/tutorials-and-quickstarts/how-to-perform-simulation-bundles-with-tenderly-sdk).

