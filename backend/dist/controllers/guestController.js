"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRoom = exports.toggleReadyPlayer = exports.createGuest = void 0;
const player_1 = __importDefault(require("../models/player"));
const room_1 = __importDefault(require("../models/room"));
const incrementHexId = (hexId) => {
    const idAsNumber = parseInt(hexId, 16) + 1;
    const newHexId = idAsNumber.toString(16).toUpperCase();
    return newHexId.padStart(6, "0");
};
const createGuest = async (req, res) => {
    try {
        console.log("Creating guest");
        const firstPlayer = await player_1.default.findOne({})
            .sort({ guestId: -1 })
            .limit(1)
            .exec();
        let newGuestId = "000001";
        if (firstPlayer) {
            newGuestId = incrementHexId(firstPlayer.guestId);
        }
        const newPlayer = new player_1.default({ guestId: newGuestId });
        await newPlayer.save();
        res.status(201).json({ guestId: newGuestId });
    }
    catch (error) {
        console.error("Failed to create guest", error);
        res.status(500).json({ error: "Failed to create guest" });
    }
};
exports.createGuest = createGuest;
const toggleReadyPlayer = async (req, res) => {
    const { guestId } = req.params;
    try {
        const player = await player_1.default.findOne({ guestId }).populate("room");
        if (!player) {
            res.status(404).json({ message: "Player not found" });
            return;
        }
        const updatedPlayer = await player_1.default.findOneAndUpdate({ guestId }, { $set: { isPlaying: !player.isPlaying } }, { new: true });
        res.status(200).json(updatedPlayer);
    }
    catch (error) {
        res.status(500).json({ message: "Error toggling player readiness", error });
    }
};
exports.toggleReadyPlayer = toggleReadyPlayer;
const leaveRoom = async (req, res) => {
    const { guestId, roomId } = req.params;
    try {
        const updatedPlayer = await player_1.default.findOneAndUpdate({ guestId }, { $set: { isPlaying: false, room: null } }, { new: true });
        if (!updatedPlayer) {
            res.status(404).json({ message: "Player not found" });
            return;
        }
        const updatedRoom = await room_1.default.findOneAndUpdate({ roomId }, {
            $inc: { numberOfPlayers: -1 },
            $pull: { players: updatedPlayer._id },
        }, { new: true });
        if (!updatedRoom) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        res.status(200).json({ player: updatedPlayer, room: updatedRoom });
    }
    catch (error) {
        res.status(500).json({ message: "Error leaving room", error });
    }
};
exports.leaveRoom = leaveRoom;
//# sourceMappingURL=guestController.js.map