/**
 * Contrat commun que tout fournisseur de recharge doit respecter. C'est ce
 * qui garantit que le reste de la plateforme ne dépend jamais d'un
 * fournisseur en particulier : on peut ajouter/retirer un adapter sans
 * toucher au delivery.engine ni au reste du code.
 */

export type DeliveryOutcome = "success" | "failed" | "manual_pending";

export interface DeliverParams {
  orderId: string;
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