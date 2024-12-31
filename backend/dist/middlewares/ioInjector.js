"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocketIO = void 0;
let io;
const setSocketIO = (ioInstance) => {
    io = ioInstance;
};
exports.setSocketIO = setSocketIO;
const ioInjector = (req, res) => {
    req.io = io;
};
exports.default = ioInjector;
//# sourceMappingURL=ioInjector.js.map