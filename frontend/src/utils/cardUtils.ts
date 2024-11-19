import PlayerRole from "../strings";
import { PlayerGameData } from "../types";

export const getTitle = (playerData: PlayerGameData | undefined): string => {
  if (!playerData) return PlayerRole.player;
  return playerData.isDealer
    ? PlayerRole.dealer
    : playerData.isSmallBlind
      ? PlayerRole.smallBlind
      : playerData.isBigBlind
        ? PlayerRole.bigBlind
        : PlayerRole.player;
};
