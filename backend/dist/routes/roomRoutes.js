"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controllers/roomController");
const roomRoutes = express_1.default.Router();
roomRoutes.post("/", (req, res) => {
    (0, roomController_1.createRoom)(req, res);
});
roomRoutes.get("/:roomId", (req, res) => {
    (0, roomController_1.getRoom)(req, res);
});
roomRoutes.put("/:roomId/join", (req, res) => {
    (0, roomController_1.joinRoom)(req, res);
});
exports.default = roomRoutes;
//# sourceMappingURL=roomRoutes.js.map