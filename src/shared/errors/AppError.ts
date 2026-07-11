/**
 * Erreur applicative standard. Toute erreur métier volontaire (validation,
 * ressource introuvable, conflit, etc.) doit passer par cette classe plutôt
 * que par un throw brut, pour que errorHandler.middleware.ts sache quoi
 * renvoyer au client.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = "Ressource introuvable") {
    return new AppError(message, 404);
  }

  static badRequest(message = "Requête invalide", details?: unknown) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = "Non authentifié") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Accès refusé") {
    return new AppError(message, 403);
  }

  static conflict(message = "Conflit") {
    return new AppError(message, 409);
  }

  static internal(message = "Erreur interne") {
    return new AppError(message, 500);
  }
}
