import type { Request } from "express";
import { AppError } from "../errors/AppError";

export function getParam(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== "string" || value.length === 0) {
    throw AppError.badRequest(`Paramètre d'URL "${key}" invalide`);
  }
  return value;
}