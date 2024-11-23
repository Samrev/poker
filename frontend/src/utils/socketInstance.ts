import { io, Socket } from "socket.io-client";

export const socketRoom: Socket = io(`${process.env.REACT_APP_API_URL}/room`);
export const socketPoker: Socket = io(`${process.env.REACT_APP_API_URL}/poker`);
