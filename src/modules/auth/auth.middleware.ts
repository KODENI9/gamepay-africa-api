import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../../shared/errors/AppError";

export const clerkAuth: RequestHandler = clerkMiddleware();

export function requireAuthenticated(req: Request, _res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    next(AppError.unauthorized("Authentification requise"));
    return;
  }
  next();
}

/**
 * Réservé aux administrateurs. Le rôle est stocké dans publicMetadata.role
 * sur le compte Clerk. Pour promouvoir un utilisateur admin : Dashboard
 * Clerk → Users → cet utilisateur → Public metadata → { "role": "admin" }.
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) {
    next(AppError.unauthorized("Authentification requise"));
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      next(AppError.forbidden("Accès réservé aux administrateurs"));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}