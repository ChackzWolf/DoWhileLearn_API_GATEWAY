"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../../../interface/enums");
const axios_1 = __importDefault(require("axios"));
// Service URLs 
const CHAT_SERVICE_URL = "http://chat-service:4000"; // Replace with your Chat Service's URL
class ChatController {
    constructor() {
        this.listCourses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Forward request to Chat Service
                const response = yield axios_1.default.get(`${CHAT_SERVICE_URL}/courses`);
                return res.status(enums_1.StatusCode.OK).json(response.data);
            }
            catch (error) {
                // Narrow down the type of error
                if (error instanceof Error) {
                    console.error("Error fetching courses:", error.message);
                }
                else {
                    console.error("Error fetching courses:", error);
                }
                return res.status(500).json({ error: "Failed to fetch courses" });
            }
        });
        this.joinChatRoom = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId, userId } = req.body;
                // Forward join room request to Chat Service
                const response = yield axios_1.default.post(`${CHAT_SERVICE_URL}/join`, { courseId, userId });
                res.status(200).json(response.data);
            }
            catch (error) {
                // Narrow down the type of error
                if (error instanceof Error) {
                    console.error("Error joining ChatRoom:", error.message);
                }
                else {
                    console.error("Error joining ChatRoom:", error);
                }
                return res.status(500).json({ error: "Failed to fetch courses" });
            }
        });
    }
}
exports.default = ChatController;
//# sourceMappingURL=controller.js.map