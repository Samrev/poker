import mongoose, { Schema, Document } from "mongoose";
import { PlayerStatus } from "../vars";

interface IGame extends Document {
  roomId: string;
  playersCards: { [key: string]: string[] };
  pokerCards: string[];
  potBalance: number;
  playersBalances: { [key: string]: number };
  playerTurn: string;
  playersBids: { [key: string]: number };
  contributedPlayersBids: { [key: string]: number };
  playersStatus: { [key: string]: PlayerStatus };
  currentBid: number;
  currentDealer: string;
  currentBigBlind: string;
  currentSmallBlind: string;
  nextTurn: { [key: string]: string };
  roundNo: number;
  firstPlayer: string;
}

const gameSchema: Schema<IGame> = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  playersCards: {
    type: Object,
    of: {
      type: [String],
      validate: {
        validator: (val: string[]) => val.length === 2,
        message: "Each player must have exactly two cards.",
      },
    },
    required: true,
  },
  pokerCards: {
    type: [String],
    required: true,
    validate: [
      (val: string[]) => val.length === 5,
      "Must have exactly 5 cards.",
    ],
  },
  potBalance: { type: Number, default: 0 },
  playersBalances: {
    type: Object,
    of: { type: Number },
    required: true,
  },
  playerTurn: { type: String, required: true },
  playersBids: {
    type: Object,
    of: { type: Number },
    required: true,
  },
  contributedPlayersBids: {
    type: Object,
    of: { type: Number },
    required: true,
  },
  playersStatus: {
    type: Object,
    of: {
      type: String,
      enum: Object.values(PlayerStatus),
    },
    required: true,
  },
  currentBid: { type: Number, default: 0 },
  currentDealer: { type: String, required: true },
  currentBigBlind: { type: String, required: true },
  currentSmallBlind: { type: String, required: true },
  nextTurn: {
    type: Object,
    of: { type: String },
    required: true,
  },
  roundNo: { type: Number, default: 0 },
  firstPlayer: { type: String, required: true },
});

const Game = mongoose.model<IGame>("Game", gameSchema);
export default Game;
