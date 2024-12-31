"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketRoomHandler = (io) => {
    io.of("/room").on("connection", (socket) => {
        console.log("A user connected", socket.id);
        socket.on("joinRoom", ({ roomId, guestId }) => {
            console.log(`Guest ${guestId} is joining room ${roomId}`);
            socket.join(roomId);
            socket.to(roomId).emit("roomStatusChanged", { guestId });
        });
        socket.on("leaveRoom", ({ roomId, guestId }) => {
            console.log(`Guest ${guestId} is leaving room ${roomId}`);
            socket.leave(roomId);
            socket.to(roomId).emit("roomStatusChanged", { guestId });
        });
        socket.on("toogleReadinessStatus", ({ roomId, guestId }) => {
            console.log(`Guest ${guestId} in room ${roomId} has toggled readiness`);
            io.of("/room").to(roomId).emit("roomStatusChanged", { guestId });
        });
        socket.on("startGame", ({ roomId }) => {
            console.log(`Game has started in the room ${roomId}`);
            socket.to(roomId).emit("gameStarted", { roomId });
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
exports.default = socketRoomHandler;
//# sourceMappingURL=roomHandlers.js.map