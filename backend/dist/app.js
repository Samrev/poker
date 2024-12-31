"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const ioInjector_1 = __importDefault(require("./middlewares/ioInjector"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(ioInjector_1.default);
// Routes
app.use("/api/guests", routes_1.guestRoutes);
app.use("/api/rooms", routes_1.roomRoutes);
app.use("/api/games", routes_1.gameRoutes);
exports.default = app;
//# sourceMappingURL=app.js.map