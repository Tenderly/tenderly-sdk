export type SimulationRequest = {
  block_number: number,
  from: string,
  to: string,
  input: string,
  state_objects: Record<string, unknown>,
  network_id: string,
}