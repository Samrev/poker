import axios, { AxiosResponse } from "axios";
import { Room } from "../types";
export const createRoom = async (
  numPlayers: Number
): Promise<string | undefined> => {
  const server = process.env.REACT_APP_API_URL!;
  try {
    const res = await axios.post(`${server}/api/rooms`, { numPlayers });
    console.log("Result status", res.status);
    if (res.status === 201 && res.data) {
      return res.data.roomId;
    } else {
      throw new Error("Status error");
    }
  } catch (error) {
    console.error("Room creation failed", error);
    return undefined;
  }
};

export const getRoom = async (
  roomId: string | undefined
): Promise<Room | undefined> => {
  const server = process.env.REACT_APP_API_URL!;
  try {
    const res = await axios.get<Room>(`${server}/api/rooms/${roomId}`);
    if (res.status === 200 && res.data) {
      console.log("Got room", res.data);
      return res.data;
    } else {
      throw new Error("Room not found");
    }
  } catch (error) {
    console.error("Failed to enter room", error);
    alert("Invalid Room ID. Please try again.");
    return undefined;
  }
};

export const joinRoom = async (
  roomId: string,
  guestId: string
): Promise<AxiosResponse | undefined> => {
  const server = process.env.REACT_APP_API_URL!;
  try {
    const res = await axios.put(
      `${server}/api/rooms/${roomId}/join/?guestId=${guestId}`
    );
    if (res.status === 200) {
      console.log(`Player ${guestId} joined room ${roomId}`);
      return res;
    } else {
      throw new Error("Failed to join room");
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 400) {
        alert("Room is full or player already in the room");
      } else if (error.response.status === 404) {
        alert("Invalid Room Id");
      }
    } else {
      console.error("An unknown error occurred:", error);
    }
    return undefined;
  }
};
