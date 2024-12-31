"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketPokerHandler = (io) => {
    io.of("/poker").on("connection", (socket) => {
        console.log("A user connected in poker namespace:", socket.id);
        socket.on("joinPoker", ({ roomId, guestId }) => {
            console.log(`Guest ${guestId} is joining poker room ${roomId} - Socket ID: ${socket.id}`);
            socket.join(roomId);
        });
        socket.on("playerMoved", ({ roomId, guestId }) => {
            console.log(`Guest ${guestId} made a move in room ${roomId} - Socket ID: ${socket.id}`);
            io.of("/poker").to(roomId).emit("pokerStatusChanged", { guestId });
        });
        socket.on("gameCompleted", ({ roomId }) => {
            console.log(`Game completed in room ${roomId} - Socket ID: ${socket.id}`);
            io.of("/poker").to(roomId).emit("enabledNextRound", { roomId });
        });
        socket.on("nextRound", ({ roomId }) => {
            console.log(`Next round started in room ${roomId} - Socket ID: ${socket.id}`);
            io.of("/poker").to(roomId).emit("pokerStatusChanged", { roomId });
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected from poker namespace: ${socket.id}`);
        });
    });
};
exports.default = socketPokerHandler;
//# sourceMappingURL=pokerHandlers.js.map