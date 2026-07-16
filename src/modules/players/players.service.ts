import { AppError } from "../../shared/errors/AppError";
import { getValidationProvider } from "../delivery/validation.selector";
import { productsRepository } from "../products/products.repository";
import type { ValidatePlayerDTO } from "./players.validation";

export const playersService = {
  async validatePlayer(input: ValidatePlayerDTO): Promise<{ username?: string }> {
    const product = await productsRepository.findById(input.productId);
    if (!product) throw AppError.notFound("Produit introuvable");

    const sku = product.providerMapping?.moogold;
    if (!sku) {
      throw AppError.badRequest("La vérification du compte n'est pas disponible pour ce produit.");
    }

    const playerId = input.playerIdExtra["playerId"];
    if (!playerId) {
      throw AppError.badRequest("Le champ playerId est requis pour la vérification.");
    }

    const provider = getValidationProvider();
    if (!provider) {
      throw AppError.badRequest("Aucun fournisseur de vérification n'est configuré.");
    }

    const result = await provider.validatePlayer({
      productSku: sku,
      playerId,
      playerIdExtra: input.playerIdExtra,
    });

    if (!result.valid) {
      throw AppError.badRequest("Compte introuvable. Vérifiez l'ID saisi.");
    }

    return { username: result.username };
  },
};