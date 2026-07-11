import type { DeliverParams, DeliverResult, DeliveryProvider } from "./provider.interface";

/**
 * Fournisseur "manuel" — actif tant qu'aucun vrai fournisseur de recharges
 * (API) n'est branché. Il ne livre rien automatiquement : il place la
 * commande en traitement ("processing"), à finaliser à la main via
 * PATCH /api/v1/orders/:id/status une fois la recharge effectuée
 * manuellement par l'équipe.
 */
export const manualProvider: DeliveryProvider = {
  name: "manual",

  async checkAvailability(): Promise<boolean> {
    return true;
  },

  async deliver(_params: DeliverParams): Promise<DeliverResult> {
    return {
      outcome: "manual_pending",
      rawResponse: {
        reason: "Aucun fournisseur automatique configuré — traitement manuel requis",
      },
    };
  },
};