import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  numberOfPlayers: number;
  maxNumberOfPlayers: number;
  players: mongoose.Types.ObjectId[];
}

const roomSchema: Schema<IRoom> = new mongoose.Schema({
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
    min: 3,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

const Room: Model<IRoom> = mongoose.model<IRoom>("Room", roomSchema);
export default Room;
