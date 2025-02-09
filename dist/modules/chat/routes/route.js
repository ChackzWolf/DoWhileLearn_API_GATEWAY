"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("../controllers/controller"));
const controller = new controller_1.default();
const chatRoute = (0, express_1.default)();
chatRoute.use(express_1.default.json());
// Route to fetch courses
chatRoute.get("/courses", controller.joinChatRoom);
// Route to join a chat room (could also validate here)
chatRoute.post("/join", controller.joinChatRoom);
exports.default = chatRoute;
//# sourceMappingURL=route.js.map