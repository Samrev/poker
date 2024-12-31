import { Server as SocketIOServer } from "socket.io";
import socketRoomHandler from "./roomHandlers";
import socketPokerHandler from "./pokerHandlers";

const socketHandlers = (io: SocketIOServer): void => {
  socketRoomHandler(io);
  socketPokerHandler(io);
};

export default socketHandlers;
