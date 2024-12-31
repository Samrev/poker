"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const roomHandlers_1 = __importDefault(require("./roomHandlers"));
const pokerHandlers_1 = __importDefault(require("./pokerHandlers"));
const socketHandlers = (io) => {
    (0, roomHandlers_1.default)(io);
    (0, pokerHandlers_1.default)(io);
};
exports.default = socketHandlers;
//# sourceMappingURL=index.js.map