import { AppError } from "../../shared/errors/AppError";
import { moogoldClient } from "../delivery/providers/moogold.client";
import { gamesRepository } from "../games/games.repository";
import { productsRepository } from "./products.repository";
import type { Product } from "./products.types";
import type { CreateProductDTO, UpdateProductDTO } from "./products.validation";

async function assertGameExists(gameId: string): Promise<void> {
  const game = await gamesRepository.findById(gameId);
  if (!game) {
    throw AppError.badRequest(`Aucun jeu trouvé avec l'id "${gameId}"`);
  }
}

export const productsService = {
  async listProducts(filters: { gameId?: string; onlyActive?: boolean }): Promise<Product[]> {
    return productsRepository.findAll(filters);
  },

  async getProductById(id: string): Promise<Product> {
    const product = await productsRepository.findById(id);
    if (!product) throw AppError.notFound("Produit introuvable");
    return product;
  },

  async getServerListForProduct(id: string): Promise<Record<string, string>> {
    const product = await productsRepository.findById(id);
    if (!product) throw AppError.notFound("Produit introuvable");

    const moogoldId = product.providerMapping?.moogold;
    if (!moogoldId) return {};

    try {
      return await moogoldClient.getServerList(Number(moogoldId));
    } catch {
      return {};
    }
  },

  async createProduct(input: CreateProductDTO): Promise<Product> {
    await assertGameExists(input.gameId);
    return productsRepository.create(input);
  },

  async updateProduct(id: string, input: UpdateProductDTO): Promise<Product> {
    if (input.gameId) {
      await assertGameExists(input.gameId);
    }
    const updated = await productsRepository.update(id, input);
    if (!updated) throw AppError.notFound("Produit introuvable");
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    const deleted = await productsRepository.delete(id);
    if (!deleted) throw AppError.notFound("Produit introuvable");
  },
};