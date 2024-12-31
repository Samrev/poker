"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roomSchema = new mongoose_1.default.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    numberOfPlayers: {
        type: Number,
        default: 3,
        min: 3,
    },
    maxNumberOfPlayers: {
        type: Number,
        default: 4,
    },
    players: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Player",
        },
    ],
});
const Room = mongoose_1.default.model("Room", roomSchema);
exports.default = Room;
//# sourceMappingURL=room.js.map