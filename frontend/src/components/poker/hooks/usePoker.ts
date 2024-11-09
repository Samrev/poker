import { useEffect, useState } from "react";
import { getGame } from "../../../api/game";
import { PlayerGameData } from "../../../types";

export const usePoker = (
  roomId: string | undefined,
  guestId: string | undefined
) => {
  const [playerData, setplayerData] = useState<PlayerGameData | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchplayerData = async () => {
      try {
        const response = await getGame(roomId, guestId);
        console.log(response);
        setplayerData(response as PlayerGameData);
      } catch (err) {
        setError("Failed to fetch game data");
      }
    };

    if (roomId && guestId) {
      fetchplayerData();
    }
  }, [roomId, guestId]);

  useEffect(() => {
    console.log("Updated playerData:", playerData);
  }, [playerData]);

  return { playerData, error };
};
