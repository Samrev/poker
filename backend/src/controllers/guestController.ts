import { Request, Response } from "express";
import Player from "../models/player";
import Room, { IRoom } from "../models/room";

const incrementHexId = (hexId: string): string => {
  const idAsNumber = parseInt(hexId, 16) + 1;
  const newHexId = idAsNumber.toString(16).toUpperCase();
  return newHexId.padStart(6, "0");
};

export const createGuest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Creating guest");
    const firstPlayer = await Player.findOne({})
      .sort({ guestId: -1 })
      .limit(1)
      .exec();

    let newGuestId = "000001";
    if (firstPlayer) {
      newGuestId = incrementHexId(firstPlayer.guestId);
    }

    const newPlayer = new Player({ guestId: newGuestId });
    await newPlayer.save();
    res.status(201).json({ guestId: newGuestId });
  } catch (error) {
    console.error("Failed to create guest", error);
    res.status(500).json({ error: "Failed to create guest" });
  }
};

export const toggleReadyPlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { guestId } = req.params;

  try {
    const player = await Player.findOne({ guestId }).populate<IRoom>("room");

    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    const updatedPlayer = await Player.findOneAndUpdate(
      { guestId },
      { $set: { isPlaying: !player.isPlaying } },
      { new: true }
    );

    res.status(200).json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ message: "Error toggling player readiness", error });
  }
};

export const leaveRoom = async (req: Request, res: Response): Promise<void> => {
  const { guestId, roomId } = req.params;

  try {
    const updatedPlayer = await Player.findOneAndUpdate(
      { guestId },
      { $set: { isPlaying: false, room: null } },
      { new: true }
    );

    if (!updatedPlayer) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      {
        $inc: { numberOfPlayers: -1 },
        $pull: { players: updatedPlayer._id },
      },
      { new: true }
    );

    if (!updatedRoom) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    res.status(200).json({ player: updatedPlayer, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: "Error leaving room", error });
  }
};
