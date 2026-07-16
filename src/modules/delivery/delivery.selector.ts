import { manualProvider } from "./providers/manual.adapter";
import { moogoldProvider } from "./providers/moogold.adapter";
import type { DeliveryProvider } from "./providers/provider.interface";

/**moogold.adapter.ts
 * Liste des fournisseurs enregistrés, dans l'ordre de priorité. MooGold est
 * essayé en premier (checkAvailability renvoie false tant que les clés ne
 * sont pas configurées, ou si le solde est à 0) ; "manual" reste le filet
 * de sécurité si MooGold est indisponible ou pas encore configuré.
 */
const REGISTERED_PROVIDERS: DeliveryProvider[] = [moogoldProvider, manualProvider];

export async function selectProvider(): Promise<DeliveryProvider> {
  for (const provider of REGISTERED_PROVIDERS) {
    if (await provider.checkAvailability()) {
      return provider;
    }
  }
  throw new Error("Aucun fournisseur de livraison disponible");
}