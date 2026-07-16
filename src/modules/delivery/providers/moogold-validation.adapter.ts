import { moogoldClient } from "./moogold.client";
import type {
  ValidatePlayerParams,
  ValidatePlayerResult,
  ValidationProvider,
} from "./validation-provider.interface";

export const moogoldValidationProvider: ValidationProvider = {
  name: "moogold",

  async validatePlayer(params: ValidatePlayerParams): Promise<ValidatePlayerResult> {
    const result = await moogoldClient.validateProduct({
      productId: params.productSku,
      playerId: params.playerId,
      server: params.playerIdExtra?.serverId ?? params.playerIdExtra?.server,
    });

    const valid = result.status === true || result.status === "true";
    return { valid, username: result.username, rawResponse: result };
  },
};