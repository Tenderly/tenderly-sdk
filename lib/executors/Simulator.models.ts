export type TransactionParameters = {
  from: string;
  to: string;
  input: string;
  value?: string;
  gas?: number,
  gas_price?: string,
  block_header?: Record<string, unknown>
}

export type SimulationDetails = {
  transaction: TransactionParameters,
  blockNumber?: number,
  override?: Record<string, unknown>
}

export type SimulationRequest = {
  block_number: number,
  from: string,
  to: string,
  input: string,
  state_objects: Record<string, unknown>,
  network_id: string,
  value?: string;
  save?: boolean;
  save_if_fails?: boolean,
  estimate_gas?: boolean,
}

export type SimulationResponse = {
  transaction: {
    from: string,
    to: string,
    timestamp: string,
    transaction_info: {
      state_diff: {
        address: string,
        soltype: {
          name: string,
          type: string,
          storage_location: string,
          components: unknown,
          offset: number,
          index: string,
          indexed: boolean,
          simple_type: unknown
        },
        original: string,
        dirty: string,
        raw: unknown
      }[]
    }
    //...
  },
  simulation: Record<string, unknown>,
}

