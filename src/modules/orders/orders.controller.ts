import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { getParam } from "../../shared/utils/getParam";
import { ordersService } from "./orders.service";
import type { Order } from "./orders.types";
import { createOrderSchema, updateOrderStatusSchema } from "./orders.validation";

function requireUserId(req: Request): string {
  const { userId } = getAuth(req);
  if (!userId) {
    throw AppError.unauthorized("Authentification requise");
  }
  return userId;
}

export const ordersController = {

    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
        const statusParam = req.query.status;
        const status = typeof statusParam === "string" ? (statusParam as Order["status"]) : undefined;
        const orders = await ordersService.listAllOrders({ status });
        res.json({ data: orders });
        } catch (err) {
        next(err);
        }
    },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const orders = await ordersService.listOrdersForUser(userId);
      res.json({ data: orders });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const order = await ordersService.getOrderById(getParam(req, "id"), userId);
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const order = await ordersService.createOrder(userId, parsed.data);
      res.status(201).json({ data: order });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateOrderStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const order = await ordersService.transitionStatus(getParam(req, "id"), parsed.data.status);
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
};