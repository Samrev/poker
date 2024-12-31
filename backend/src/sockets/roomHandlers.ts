import { Server as SocketIOServer, Socket } from "socket.io";

interface JoinRoomPayload {
  roomId: string;
  guestId: string;
}

interface LeaveRoomPayload {
  roomId: string;
  guestId: string;
}

interface ToggleReadinessPayload {
  roomId: string;
  guestId: string;
}

interface StartGamePayload {
  roomId: string;
}

const socketRoomHandler = (io: SocketIOServer): void => {
  io.of("/room").on("connection", (socket: Socket) => {
    console.log("A user connected", socket.id);

    socket.on("joinRoom", ({ roomId, guestId }: JoinRoomPayload) => {
      console.log(`Guest ${guestId} is joining room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("roomStatusChanged", { guestId });
    });

    socket.on("leaveRoom", ({ roomId, guestId }: LeaveRoomPayload) => {
      console.log(`Guest ${guestId} is leaving room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit("roomStatusChanged", { guestId });
    });

    socket.on(
      "toogleReadinessStatus",
      ({ roomId, guestId }: ToggleReadinessPayload) => {
        console.log(`Guest ${guestId} in room ${roomId} has toggled readiness`);
        io.of("/room").to(roomId).emit("roomStatusChanged", { guestId });
      }
    );

    socket.on("startGame", ({ roomId }: StartGamePayload) => {
      console.log(`Game has started in the room ${roomId}`);
      socket.to(roomId).emit("gameStarted", { roomId });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default socketRoomHandler;
