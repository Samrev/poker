"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the Player Schema
const playerSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Room",
        default: null,
    },
});
const Player = mongoose_1.default.model("Player", playerSchema);
exports.default = Player;
//# sourceMappingURL=player.js.map