import { AppError } from "../../shared/errors/AppError";
import { gamesRepository } from "../games/games.repository";
import { productsRepository } from "../products/products.repository";
import { ordersRepository } from "./orders.repository";
import { assertValidTransition } from "./orders.state-machine";
import type { Order, OrderStatus } from "./orders.types";
import type { CreateOrderDTO } from "./orders.validation";

function assertRequiredPlayerFields(
  playerIdFields: { key: string; required: boolean }[],
  playerIdExtra: Record<string, string>
): void {
  const missing = playerIdFields
    .filter((field) => field.required)
    .filter((field) => !playerIdExtra[field.key] || playerIdExtra[field.key].trim() === "");

  if (missing.length > 0) {
    throw AppError.badRequest(
      `Champs requis manquants pour ce jeu : ${missing.map((f) => f.key).join(", ")}`
    );
  }
}

export const ordersService = {
  async listOrdersForUser(userId: string): Promise<Order[]> {
    return ordersRepository.findAllByUser(userId);
  },

  async listAllOrders(
    filters: { status?: OrderStatus }
  ): Promise<(Order & { gameName?: string; productName?: string })[]> {
    const orders = await ordersRepository.findAll(filters);

    const gameIds = [...new Set(orders.map((o) => o.gameId))];
    const productIds = [...new Set(orders.map((o) => o.productId))];

    const games = await Promise.all(gameIds.map((id) => gamesRepository.findById(id)));
    const products = await Promise.all(productIds.map((id) => productsRepository.findById(id)));

    const gameNameById = new Map(games.filter((g) => g !== null).map((g) => [g!.id, g!.name]));
    const productNameById = new Map(products.filter((p) => p !== null).map((p) => [p!.id, p!.name]));

    return orders.map((order) => ({
      ...order,
      gameName: gameNameById.get(order.gameId),
      productName: productNameById.get(order.productId),
    }));
  },

  async getOrderById(id: string, requestingUserId: string): Promise<Order> {
    const order = await ordersRepository.findById(id);
    if (!order) throw AppError.notFound("Commande introuvable");

    if (order.userId !== requestingUserId) {
      throw AppError.forbidden("Vous n'avez pas accès à cette commande");
    }

    return order;
  },

  async createOrder(userId: string, input: CreateOrderDTO): Promise<Order> {
    const game = await gamesRepository.findById(input.gameId);
    if (!game || !game.isActive) {
      throw AppError.badRequest(`Aucun jeu actif trouvé avec l'id "${input.gameId}"`);
    }

    const product = await productsRepository.findById(input.productId);
    if (!product || !product.isActive) {
      throw AppError.badRequest(`Aucun produit actif trouvé avec l'id "${input.productId}"`);
    }
    if (product.gameId !== input.gameId) {
      throw AppError.badRequest("Ce produit n'appartient pas au jeu indiqué");
    }

    assertRequiredPlayerFields(game.playerIdFields, input.playerIdExtra);

    return ordersRepository.create({
      userId,
      gameId: input.gameId,
      productId: input.productId,
      playerId: input.playerId,
      playerIdExtra: input.playerIdExtra,
      price: product.price,
      currency: product.currency,
    });
  },

  async transitionStatus(id: string, to: OrderStatus): Promise<Order> {
    const order = await ordersRepository.findById(id);
    if (!order) throw AppError.notFound("Commande introuvable");

    assertValidTransition(order.status, to);

    const updated = await ordersRepository.updateStatus(id, to);
    if (!updated) throw AppError.notFound("Commande introuvable");
    return updated;
  },
};