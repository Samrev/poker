import { Request, Response } from "express";
import Room, { IRoom } from "../models/room";
import Player, { IPlayer } from "../models/player";

const incrementHexId = (hexId: string): string => {
  const idAsNumber = parseInt(hexId, 16) + 1;
  const newHexId = idAsNumber.toString(16).toUpperCase();
  return newHexId.padStart(6, "0");
};

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { numPlayers } = req.body;
    if (!numPlayers || isNaN(numPlayers) || numPlayers <= 0) {
      res.status(400).json({ message: "Invalid number of players" });
      return;
    }
    const lastRoom = await Room.findOne({})
      .sort({ roomId: -1 })
      .limit(1)
      .exec();
    let newRoomId = "000001";
    if (lastRoom) {
      newRoomId = incrementHexId(lastRoom.roomId);
    }
    const newRoom = new Room({
      roomId: newRoomId,
      maxNumberOfPlayers: numPlayers,
    });
    await newRoom.save();
    res.status(201).json({ roomId: newRoomId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
};

export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId }).populate<IPlayer>("players");
    if (room) {
      const roomData = {
        roomId: room.roomId,
        maxNumberOfPlayers: room.maxNumberOfPlayers,
        numberOfPlayers: room.numberOfPlayers,
        players: room.players.map((player: any) => ({
          guestId: player.guestId,
          isPlaying: player.isPlaying,
          roomId: room.roomId,
        })),
      };
      res.status(200).json(roomData);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinRoom = async (req: Request, res: Response): Promise<void> => {
  const { roomId } = req.params;
  const { guestId } = req.query as { guestId: string };
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    if (room.numberOfPlayers >= room.maxNumberOfPlayers) {
      res.status(400).json({ message: "Room is full" });
      return;
    }
    const playerExists = room.players.some(
      (player: any) => player.guestId === guestId
    );
    if (playerExists) {
      res.status(400).json({ message: "Player already in the room" });
      return;
    }
    const updatedPlayer = await Player.findOneAndUpdate(
      { guestId },
      { $set: { room } },
      { new: true }
    );
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      {
        $push: { players: updatedPlayer },
        $inc: { numberOfPlayers: 1 },
      },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Error joining room" });
  }
};
