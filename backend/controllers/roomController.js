import Room from "../models/room.js";
import Player from "../models/player.js";
const incrementHexId = (hexId) => {
  const idAsNumber = parseInt(hexId, 16) + 1;
  const newHexId = idAsNumber.toString(16).toUpperCase();
  return newHexId.padStart(6, "0");
};

export const createRoom = async (req, res) => {
  try {
    const { numPlayers } = req.body;
    if (!numPlayers || isNaN(numPlayers) || numPlayers <= 0) {
      return res.status(400).json({ message: "Invalid number of players" });
    }
    console.log("creating room");
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
    console.error("Failed to create room", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId }).populate("players");

    if (room) {
      const roomData = {
        roomId: room.roomId,
        maxNumberOfPlayers: room.maxNumberOfPlayers,
        numberOfPlayers: room.numberOfPlayers,
        players: room.players.map((player) => ({
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
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinRoom = async (req, res) => {
  const { roomId } = req.params;
  const { guestId } = req.query;
  try {
    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    if (room.numberOfPlayers >= room.maxNumberOfPlayers) {
      return res.status(400).json({ message: "Room is full" });
    }
    const playerExists = room.players.some(
      (player) => player.guestId === guestId
    );

    if (playerExists) {
      return res.status(400).json({ message: "Player already in the room" });
    }
    const updatedPlayer = await Player.findOneAndUpdate(
      { guestId: guestId },
      {
        $set: { room: room },
      },
      { new: true }
    );
    // console.log("updated_player" , updatedPlayer);
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId: roomId },
      {
        $push: { players: updatedPlayer },
        $inc: { numberOfPlayers: 1 },
      },
      { new: true }
    );
    // console.log("updated room", updatedRoom);
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error joining room", error);
    res.status(500).json({ message: "Error joining room" });
  }
};
