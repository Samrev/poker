import axios from "axios";

// Create Guest API (Already Defined)
export const createGuest = async (): Promise<string | undefined> => {
  try {
    const server = process.env.REACT_APP_API_BASE_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }
    const res = await axios.post(`${server}/api/guests`);
    if (res.status === 201 && res.data) {
      const guestId: string = res.data.guestId;
      return guestId;
    } else {
      console.log("Error creating guest");
    }
  } catch (error) {
    console.error("Error creating guest", error);
    return undefined;
  }
};

// Toggle Ready Player API (Already Defined)
export const toggleReadyPlayer = async (
  guestId: string | null
): Promise<void> => {
  try {
    const server = process.env.REACT_APP_API_BASE_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }

    await axios.put(`${server}/api/guests/${guestId}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        console.log("Player not found");
      } else if (error.response.status === 500) {
        console.log("Error toggling player readiness");
      }
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

// Leave Room API
export const leaveRoom = async (
  roomId: string,
  guestId: string | null
): Promise<void> => {
  try {
    const server = process.env.REACT_APP_API_BASE_URL;
    if (!server) {
      throw new Error("API base URL is not defined");
    }

    await axios.put(`${server}/api/guests/leave/${roomId}/${guestId}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        console.log("Room or Player not found");
      } else if (error.response.status === 500) {
        console.log("Error leaving the room");
      }
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};
