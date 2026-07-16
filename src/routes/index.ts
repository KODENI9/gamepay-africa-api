import { Router } from "express";
import { analyticsRouter } from "../modules/analytics/analytics.routes";
import { deliveryRouter } from "../modules/delivery/delivery.routes";
import { expensesRouter } from "../modules/expenses/expenses.routes";
import { gamesRouter } from "../modules/games/games.routes";
import { ordersRouter } from "../modules/orders/orders.routes";
import { paymentsRouter } from "../modules/payments/payments.routes";
import { playersRouter } from "../modules/players/players.routes";
import { productsRouter } from "../modules/products/products.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/games", gamesRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/analytics", analyticsRouter);
router.use("/expenses", expensesRouter);
router.use("/players", playersRouter);
router.use("/delivery", deliveryRouter);

export const apiRouter = router;