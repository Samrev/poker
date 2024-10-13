import Player from "../models/player.js";
import Room from "../models/room.js";
import io from "../server.js";

const incrementHexId = (hexId) => {
  const idAsNumber = parseInt(hexId, 16) + 1;
  const newHexId = idAsNumber.toString(16).toUpperCase();
  return newHexId.padStart(6, "0");
};

export const createGuest = async (req, res) => {
  try {
    console.log("creating guest");
    const lastPlayer = await Player.findOne({})
      .sort({ guestId: -1 })
      .limit(1)
      .exec();
    let newGuestId = "000001";
    if (lastPlayer) {
      newGuestId = incrementHexId(lastPlayer.guestId);
    }
    const newPlayer = new Player({ guestId: newGuestId });
    await newPlayer.save();
    res.status(201).json({ guestId: newGuestId });
  } catch (error) {
    console.error("Failed to create guest", error);
    res.status(500).json({ error: "Failed to create guest" });
  }
};

export const toggleReadyPlayer = async (req, res) => {
  const { guestId } = req.params;

  try {
    const player = await Player.findOne({ guestId: guestId }).populate("room");
    console.log("Player", player);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const updatedPlayer = await Player.findOneAndUpdate(
      { guestId: guestId },
      { $set: { isPlaying: !player.isPlaying } },
      { new: true }
    );
    io.to(player.room.roomId).emit("PlayerReadinessToggled");

    return res.status(200).json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ message: "Error toggling player readiness", error });
  }
};

export const leaveRoom = async (req, res) => {
  const { guestId, roomId } = req.params;

  try {
    // Find and update the player to leave the room
    const updatedPlayer = await Player.findOneAndUpdate(
      { guestId: guestId },
      { $set: { isPlaying: false, room: null } },
      { new: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Find and update the room: remove the player and decrement the player count
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: { numberOfPlayers: -1 },
        $pull: { players: updatedPlayer._id }, // Remove the player from the room
      },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json({ player: updatedPlayer, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: "Error leaving room", error });
  }
};
