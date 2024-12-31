import { Server as SocketIOServer, Socket } from "socket.io";

interface JoinPokerPayload {
  roomId: string;
  guestId: string;
}

interface PlayerMovedPayload {
  roomId: string;
  guestId: string;
}

interface GameCompletedPayload {
  roomId: string;
}

interface NextRoundPayload {
  roomId: string;
}

const socketPokerHandler = (io: SocketIOServer): void => {
  io.of("/poker").on("connection", (socket: Socket) => {
    console.log("A user connected in poker namespace:", socket.id);

    socket.on("joinPoker", ({ roomId, guestId }: JoinPokerPayload) => {
      console.log(
        `Guest ${guestId} is joining poker room ${roomId} - Socket ID: ${socket.id}`
      );
      socket.join(roomId);
    });

    socket.on("playerMoved", ({ roomId, guestId }: PlayerMovedPayload) => {
      console.log(
        `Guest ${guestId} made a move in room ${roomId} - Socket ID: ${socket.id}`
      );
      io.of("/poker").to(roomId).emit("pokerStatusChanged", { guestId });
    });

    socket.on("gameCompleted", ({ roomId }: GameCompletedPayload) => {
      console.log(`Game completed in room ${roomId} - Socket ID: ${socket.id}`);
      io.of("/poker").to(roomId).emit("enabledNextRound", { roomId });
    });

    socket.on("nextRound", ({ roomId }: NextRoundPayload) => {
      console.log(
        `Next round started in room ${roomId} - Socket ID: ${socket.id}`
      );
      io.of("/poker").to(roomId).emit("pokerStatusChanged", { roomId });
      io.of("/poker").to(roomId).emit("newGame", { roomId });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from poker namespace: ${socket.id}`);
    });
  });
};

export default socketPokerHandler;
