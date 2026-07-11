export type DeliveryOutcome = "success" | "failed" | "manual_pending";

export interface DeliverParams {
  productSku: string;
  playerId: string;
  playerIdExtra?: Record<string, string>;
}

export interface DeliverResult {
  outcome: DeliveryOutcome;
  externalTransactionId?: string;
  rawResponse: unknown;
}

export interface DeliveryProvider {
  name: string;
  checkAvailability(): Promise<boolean>;
  deliver(params: DeliverParams): Promise<DeliverResult>;
}