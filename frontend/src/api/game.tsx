import axios from "axios";
import { PlayerGameData } from "../types";

export const startGame = async (
  roomId: string | undefined
): Promise<any | undefined> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.post(`${server}/api/games/`, {
      roomId: roomId,
    });

    if (res.data && res.status === 200) {
      return res.data;
    } else {
      console.error("Failed to start the game: No game data returned");
    }
  } catch (error) {
    console.error("Error starting the game:", error);
  }
};

export const getGame = async (
  roomId: string | undefined,
  guestId: string | undefined
): Promise<PlayerGameData | undefined> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.get(`${server}/api/games`, {
      params: {
        roomId: roomId,
        guestId: guestId,
      },
    });

    if (res.data && res.status === 200) {
      return res.data;
    } else {
      console.error("Failed to start the game: No game data returned");
    }
  } catch (error) {
    console.error("Error getting the game:", error);
  }
};
