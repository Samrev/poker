import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPlayer extends Document {
  guestId: string;
  isPlaying: boolean;
  room: mongoose.Types.ObjectId | null;
}

// Define the Player Schema
const playerSchema: Schema<IPlayer> = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    default: null,
  },
});

const Player: Model<IPlayer> = mongoose.model<IPlayer>("Player", playerSchema);
export default Player;
