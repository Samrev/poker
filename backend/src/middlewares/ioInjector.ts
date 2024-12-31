import { NextFunction, Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | undefined;

export const setSocketIO = (ioInstance: SocketIOServer): void => {
  io = ioInstance;
};

interface ExtendedRequest extends Request {
  io?: SocketIOServer;
}

const ioInjector = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  req.io = io;
  next();
};

export default ioInjector;
