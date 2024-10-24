import mongoose from "mongoose";

// Define the Room Schema
const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  numberOfPlayers: {
    type: Number,
    default: 0,
  },
  maxNumberOfPlayers: {
    type: Number,
    default: 4,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  isGameStarted: {
    type: Boolean,
    default: false,
  },
  Game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    default: null,
  },
});

// Create and export the Room model
const Room = mongoose.model("Room", roomSchema);
export default Room;
