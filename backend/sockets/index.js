import socketRoomHandler from "./roomHandlers.js";
import socketPokerHandler from "./pokerHandlers.js";

const socketHandlers = (io) => {
  socketRoomHandler(io);
  socketPokerHandler(io);
};

export default socketHandlers;
