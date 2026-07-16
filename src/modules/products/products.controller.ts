import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { getParam } from "../../shared/utils/getParam";
import { productsService } from "./products.service";
import { createProductSchema, updateProductSchema } from "./products.validation";

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const gameId = typeof req.query.gameId === "string" ? req.query.gameId : undefined;
      const onlyActive = req.query.all !== "true";
      const products = await productsService.listProducts({ gameId, onlyActive });
      res.json({ data: products });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getProductById(getParam(req, "id"));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async getServerList(req: Request, res: Response, next: NextFunction) {
      try {
        const servers = await productsService.getServerListForProduct(getParam(req, "id"));
        res.json({ data: servers });
      } catch (err) {
        next(err);
      }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const product = await productsService.createProduct(parsed.data);
      res.status(201).json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const product = await productsService.updateProduct(getParam(req, "id"), parsed.data);
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await productsService.deleteProduct(getParam(req, "id"));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};