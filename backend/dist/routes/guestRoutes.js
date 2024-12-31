"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const guestController_1 = require("../controllers/guestController");
const guestRoutes = express_1.default.Router();
guestRoutes.post("/", (req, res) => {
    (0, guestController_1.createGuest)(req, res);
});
guestRoutes.put("/:guestId", (req, res) => {
    (0, guestController_1.toggleReadyPlayer)(req, res);
});
guestRoutes.put("/leave/:roomId/:guestId", (req, res) => {
    (0, guestController_1.leaveRoom)(req, res);
});
exports.default = guestRoutes;
//# sourceMappingURL=guestRoutes.js.map