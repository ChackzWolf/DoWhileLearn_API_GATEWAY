import { StatusCode } from "../../../interface/enums";
import axios from "axios";
import { Request, Response } from "express";
import { ServiceError } from "@grpc/grpc-js";
import { CourseClient } from "../../../config/grpc-client/courseClient"; 
// Service URLs 
const CHAT_SERVICE_URL = "http://chat-service:4000"; // Replace with your Chat Service's URL

 
export default class ChatController {
    public listCourses = async (req:Request, res:Response) => {
        try {
          // Forward request to Chat Service
          const response = await axios.get(`${CHAT_SERVICE_URL}/courses`);
          return res.status(StatusCode.OK).json(response.data);
        }  catch (error) {
            // Narrow down the type of error
            if (error instanceof Error) {
              console.error("Error fetching courses:", error.message);
            } else {
              console.error("Error fetching courses:", error);
            }
            return res.status(500).json({ error: "Failed to fetch courses" });
          }
      };

      public joinChatRoom = async (req:Request, res: Response) => { 
        try {
          const { courseId, userId } = req.body;
          // Forward join room request to Chat Service
          const response = await axios.post(`${CHAT_SERVICE_URL}/join`, { courseId, userId });
          res.status(200).json(response.data);
        }  catch (error) {
            // Narrow down the type of error
            if (error instanceof Error) {
              console.error("Error joining ChatRoom:", error.message);
            } else {
              console.error("Error joining ChatRoom:", error);
            }
            return res.status(500).json({ error: "Failed to fetch courses" });
          }
      };
}

