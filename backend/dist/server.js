"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const sockets_1 = __importDefault(require("./sockets"));
// Configure environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
// Connect to database
(0, config_1.default)();
const server = app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: `${process.env.FRONTEND_URL}`,
        methods: ["GET", "POST", "PUT"],
    },
});
(0, sockets_1.default)(io);
//# sourceMappingURL=server.js.map