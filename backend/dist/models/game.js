"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const vars_1 = require("../vars");
const gameSchema = new mongoose_1.default.Schema({
    roomId: { type: String, required: true, unique: true },
    playersCards: {
        type: Object,
        of: {
            type: [String],
            validate: {
                validator: (val) => val.length === 2,
                message: "Each player must have exactly two cards.",
            },
        },
        required: true,
    },
    pokerCards: {
        type: [String],
        required: true,
        validate: [
            (val) => val.length === 5,
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
            enum: Object.values(vars_1.PlayerStatus),
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
const Game = mongoose_1.default.model("Game", gameSchema);
exports.default = Game;
//# sourceMappingURL=game.js.map