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

export const checkGame = async (
  roomId: string | undefined,
  guestId: string | undefined
): Promise<any> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }

    const res = await axios.put(`${server}/api/games/check`, null, {
      params: { roomId, guestId },
    });
    if (res.status === 200) {
      console.log("check successful");
      return res.data;
    } else {
      throw new Error("Failed to check the game");
    }
  } catch (error) {
    console.error("Error checking the bid:", error);
    throw error;
  }
};

export const raiseGame = async (
  roomId: string | undefined,
  guestId: string | undefined,
  bid: number
): Promise<any> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.put(`${server}/api/games/raise`, null, {
      params: {
        roomId: roomId,
        guestId: guestId,
        bid: bid,
      },
    });

    if (res.data && res.status === 200) {
      console.log("check successful");
      return res.data;
    } else {
      console.error("Failed to raise");
    }
  } catch (error) {
    console.error("Error raising the bid:", error);
  }
};

export const allInGame = async (
  roomId: string | undefined,
  guestId: string | undefined
): Promise<any> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.put(`${server}/api/games/allIn`, null, {
      params: {
        roomId: roomId,
        guestId: guestId,
      },
    });

    if (res.data && res.status === 200) {
      return res.data;
    } else {
      console.error("Failed to all In");
    }
  } catch (error) {
    console.error("Error all In", error);
  }
};

export const foldGame = async (
  roomId: string | undefined,
  guestId: string | undefined
): Promise<any> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.put(`${server}/api/games/fold`, null, {
      params: {
        roomId: roomId,
        guestId: guestId,
      },
    });

    if (res.data && res.status === 200) {
      return res.data;
    } else {
      console.error("Failed to fold");
    }
  } catch (error) {
    console.error("Error folding", error);
  }
};

export const resetGame = async (
  roomId: string | undefined,
  guestId: string | undefined
): Promise<any> => {
  try {
    const server = process.env.REACT_APP_API_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.put(`${server}/api/games/reset`, null, {
      params: {
        guestId: guestId,
      },
    });

    if (res.data && res.status === 200) {
      return res.data;
    } else {
      console.error("Failed to reset");
    }
  } catch (error) {
    console.error("Error resetting the game", error);
  }
};
