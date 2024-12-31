"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = exports.getRoom = exports.createRoom = void 0;
const room_1 = __importDefault(require("../models/room"));
const player_1 = __importDefault(require("../models/player"));
const incrementHexId = (hexId) => {
    const idAsNumber = parseInt(hexId, 16) + 1;
    const newHexId = idAsNumber.toString(16).toUpperCase();
    return newHexId.padStart(6, "0");
};
const createRoom = async (req, res) => {
    try {
        const { numPlayers } = req.body;
        if (!numPlayers || isNaN(numPlayers) || numPlayers <= 0) {
            res.status(400).json({ message: "Invalid number of players" });
            return;
        }
        const lastRoom = await room_1.default.findOne({})
            .sort({ roomId: -1 })
            .limit(1)
            .exec();
        let newRoomId = "000001";
        if (lastRoom) {
            newRoomId = incrementHexId(lastRoom.roomId);
        }
        const newRoom = new room_1.default({
            roomId: newRoomId,
            maxNumberOfPlayers: numPlayers,
        });
        await newRoom.save();
        res.status(201).json({ roomId: newRoomId });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create room" });
    }
};
exports.createRoom = createRoom;
const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await room_1.default.findOne({ roomId }).populate("players");
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
        }
        else {
            res.status(404).json({ message: "Room not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getRoom = getRoom;
const joinRoom = async (req, res) => {
    const { roomId } = req.params;
    const { guestId } = req.query;
    try {
        const room = await room_1.default.findOne({ roomId });
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        if (room.numberOfPlayers >= room.maxNumberOfPlayers) {
            res.status(400).json({ message: "Room is full" });
            return;
        }
        const playerExists = room.players.some((player) => player.guestId === guestId);
        if (playerExists) {
            res.status(400).json({ message: "Player already in the room" });
            return;
        }
        const updatedPlayer = await player_1.default.findOneAndUpdate({ guestId }, { $set: { room } }, { new: true });
        const updatedRoom = await room_1.default.findOneAndUpdate({ roomId }, {
            $push: { players: updatedPlayer },
            $inc: { numberOfPlayers: 1 },
        }, { new: true });
        res.status(200).json(updatedRoom);
    }
    catch (error) {
        res.status(500).json({ message: "Error joining room" });
    }
};
exports.joinRoom = joinRoom;
//# sourceMappingURL=roomController.js.map