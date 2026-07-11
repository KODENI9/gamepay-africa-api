import { manualProvider } from "./providers/manual.adapter";
import type { DeliveryProvider } from "./providers/provider.interface";

/**
 * TODO: quand un vrai fournisseur sera intégré, l'ajouter AVANT
 * manualProvider ici (priorité plus haute) :
 *   const REGISTERED_PROVIDERS = [providerAAdapter, manualProvider];
 */
const REGISTERED_PROVIDERS: DeliveryProvider[] = [manualProvider];

export async function selectProvider(): Promise<DeliveryProvider> {
  for (const provider of REGISTERED_PROVIDERS) {
    if (await provider.checkAvailability()) {
      return provider;
    }
  }
  throw new Error("Aucun fournisseur de livraison disponible");
}