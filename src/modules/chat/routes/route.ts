import express from "express";
import ChatController from "../controllers/controller";

const controller = new ChatController()
const chatRoute = express();
chatRoute.use(express.json());

// Route to fetch courses
chatRoute.get("/courses", controller.joinChatRoom);

// Route to join a chat room (could also validate here)
chatRoute.post("/join", controller.joinChatRoom);

export default chatRoute;
