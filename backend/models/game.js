import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  playerCards: {
    type: Map,
    of: {
      type: [String], // Array of strings
      validate: {
        validator: arrayLimit,
        message: "Each player must have exactly two cards.",
      },
    },
    required: true,
  },
  pokerCards: {
    type: [String],
    required: true,
    validate: [pokerCardsLimit, "must have exactly 5 cards."],
  },
  potBalance: {
    type: Number,
    default: 0,
  },
  playersBalances: {
    type: Map,
    of: {
      type: Number,
    },
    required: true,
  },
  playerTurn: {
    type: String,
    required: true,
  },
  playersBids: {
    type: Map,
    of: {
      type: Number,
    },
    default: {},
  },
  playersStatus: {
    type: Map,
    of: {
      type: Boolean,
    },
    required: true,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  currentDealer: {
    type: String,
    required: true,
  },
  currentBigBlind: {
    type: String,
    required: true,
  },
  currentSmallBlind: {
    type: String,
    required: true,
  },
});

function arrayLimit(val) {
  return val.length === 2;
}

function pokerCardsLimit(val) {
  return val.length === 5;
}

const Game = mongoose.model("Game", gameSchema);
export default Game;
