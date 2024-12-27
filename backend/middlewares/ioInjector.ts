import { Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | undefined;

export const setSocketIO = (ioInstance: SocketIOServer): void => {
  io = ioInstance;
};

interface ExtendedRequest extends Request {
  io?: SocketIOServer;
}

const ioInjector = (req: ExtendedRequest, res: Response): void => {
  req.io = io;
};

export default ioInjector;
