export type SimulationResponse = {
  transaction: {
    from: string,
    to: string,
    timestamp: string,
    //...
  },
  simulation: Record<string, unknown>,
}