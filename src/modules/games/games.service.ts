import { AppError } from "../../shared/errors/AppError";
import { gamesRepository } from "./games.repository";
import type { Game } from "./games.types";
import type { CreateGameDTO, UpdateGameDTO } from "./games.validation";

export const gamesService = {
  async listGames(onlyActive: boolean): Promise<Game[]> {
    return gamesRepository.findAll(onlyActive);
  },

  async getGameById(id: string): Promise<Game> {
    const game = await gamesRepository.findById(id);
    if (!game) throw AppError.notFound("Jeu introuvable");
    return game;
  },

  async createGame(input: CreateGameDTO): Promise<Game> {
    const existing = await gamesRepository.findBySlug(input.slug);
    if (existing) {
      throw AppError.conflict(`Un jeu avec le slug "${input.slug}" existe déjà`);
    }
    return gamesRepository.create(input);
  },

  async updateGame(id: string, input: UpdateGameDTO): Promise<Game> {
    if (input.slug) {
      const existing = await gamesRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw AppError.conflict(`Un jeu avec le slug "${input.slug}" existe déjà`);
      }
    }
    const updated = await gamesRepository.update(id, input);
    if (!updated) throw AppError.notFound("Jeu introuvable");
    return updated;
  },

  async deleteGame(id: string): Promise<void> {
    const deleted = await gamesRepository.delete(id);
    if (!deleted) throw AppError.notFound("Jeu introuvable");
  },
};