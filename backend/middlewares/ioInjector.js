let io;

export const setSocketIO = (ioInstance) => {
  io = ioInstance;
};

const ioInjector = (req, res, next) => {
  req.io = io;
  next();
};

export default ioInjector;
