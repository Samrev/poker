import { useEffect, useState } from "react";
import { PlayerGameData } from "../types";
import { getGame } from "../api/game";

export const usePoker = (
  roomId: string | undefined,
  guestId: string | undefined
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [playerData, setplayerData] = useState<PlayerGameData | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setRefreshTrigger((prev) => !prev);
  };

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
  }, [roomId, guestId, refreshTrigger]);

  useEffect(() => {
    console.log("Updated playerData:", playerData);
  }, [playerData]);

  return { playerData, error, refetch };
};
