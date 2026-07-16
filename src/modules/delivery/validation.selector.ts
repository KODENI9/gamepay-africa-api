import { moogoldValidationProvider } from "./providers/moogold-validation.adapter";
import type { ValidationProvider } from "./providers/validation-provider.interface";

const REGISTERED_VALIDATION_PROVIDERS: ValidationProvider[] = [moogoldValidationProvider];

/**
 * Contrairement à delivery.selector.ts, il n'y a pas de "manual" en filet de
 * sécurité ici — si aucun fournisseur de vérification n'est configuré, la
 * vérification n'est simplement pas disponible (le service appelant doit
 * gérer ce cas, ex: ne pas bloquer le paiement si aucune vérification
 * n'existe pour ce produit).
 */
export function getValidationProvider(): ValidationProvider | null {
  return REGISTERED_VALIDATION_PROVIDERS[0] ?? null;
}