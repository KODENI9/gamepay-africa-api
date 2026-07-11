import { db } from "../../config/firebase";
import { gamesRepository } from "../games/games.repository";
import { productsRepository } from "../products/products.repository";
import type { Order } from "../orders/orders.types";

export interface DayRevenue {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface GameRevenue {
  gameId: string;
  gameName: string;
  revenue: number;
  diamondsSold: number;
  ordersCount: number;
}

export interface AnalyticsSummary {
  periodDays: number;
  totalRevenue: number;
  totalOrders: number;
  totalDiamondsSold: number;
  revenueByDay: DayRevenue[];
  revenueByGame: GameRevenue[];
}

export const analyticsService = {
  async getSummary(days: number): Promise<AnalyticsSummary> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection("orders")
      .where("status", "==", "delivered")
      .where("updatedAt", ">=", since)
      .get();

    const orders = snapshot.docs.map((doc) => doc.data() as Order);

    const [games, products] = await Promise.all([
      gamesRepository.findAll(false),
      productsRepository.findAll({}),
    ]);
    const gameNameById = new Map(games.map((g) => [g.id, g.name]));
    const productById = new Map(products.map((p) => [p.id, p]));

    let totalRevenue = 0;
    let totalDiamondsSold = 0;
    const byDay = new Map<string, DayRevenue>();
    const byGame = new Map<string, GameRevenue>();

    for (const order of orders) {
      const price = order.price;
      const diamonds = productById.get(order.productId)?.amount ?? 0;

      totalRevenue += price;
      totalDiamondsSold += diamonds;

      const updatedAt = order.updatedAt as unknown as { toDate: () => Date };
      const dateKey = updatedAt.toDate().toISOString().slice(0, 10);

      const day = byDay.get(dateKey) ?? { date: dateKey, revenue: 0, ordersCount: 0 };
      day.revenue += price;
      day.ordersCount += 1;
      byDay.set(dateKey, day);

      const game = byGame.get(order.gameId) ?? {
        gameId: order.gameId,
        gameName: gameNameById.get(order.gameId) ?? order.gameId,
        revenue: 0,
        diamondsSold: 0,
        ordersCount: 0,
      };
      game.revenue += price;
      game.diamondsSold += diamonds;
      game.ordersCount += 1;
      byGame.set(order.gameId, game);
    }

    return {
      periodDays: days,
      totalRevenue,
      totalOrders: orders.length,
      totalDiamondsSold,
      revenueByDay: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)),
      revenueByGame: Array.from(byGame.values()).sort((a, b) => b.revenue - a.revenue),
    };
  },
};