import { useEffect, useState } from "react";
import { Room } from "../types";
import { getRoom } from "../api/room";

export const useRoom = (roomId: string) => {
  const [roomData, setRoomData] = useState<Room>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setRefreshTrigger((prev) => !prev);
  };
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const room = await getRoom(roomId);
        if (room) {
          setRoomData(room as Room);
        }
      } catch (error) {
        setError("Failed to fetch game data");
      }
    };
    fetchRoomData();
  }, [roomId, refreshTrigger]);

  return {
    roomData,
    error,
    refetch,
  };
};
