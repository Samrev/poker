import axios from "axios";

export const startGame = async (
  roomId: string | undefined
): Promise<any | undefined> => {
  try {
    const server = process.env.REACT_APP_API_BASE_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.post(`${server}/api/games/${roomId}`);
    if (res.data && res.status === 200) {
      return res.data;
    } else {
      console.error("Failed to start the game: No game data returned");
    }
  } catch (error) {
    console.error("Error starting the game:", error);
  }
};
