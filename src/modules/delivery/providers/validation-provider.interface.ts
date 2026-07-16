/**
 * Contrat commun pour la vérification d'un compte joueur AVANT paiement
 * (afficher son pseudo pour confirmation, comme Kelly Gaming). Découplé de
 * DeliveryProvider : un fournisseur peut savoir valider un compte sans
 * forcément être celui qui livre la commande, et inversement.
 */
export interface ValidatePlayerParams {
  productSku: string;
  playerId: string;
  playerIdExtra?: Record<string, string>;
}

export interface ValidatePlayerResult {
  valid: boolean;
  username?: string;
  rawResponse: unknown;
}

export interface ValidationProvider {
  name: string;
  validatePlayer(params: ValidatePlayerParams): Promise<ValidatePlayerResult>;
}