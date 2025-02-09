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
exports.setupSocket = exports.globalIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const chatClient_1 = require("../config/grpc-client/chatClient");
const userClient_1 = require("../config/grpc-client/userClient");
const courseClient_1 = require("../config/grpc-client/courseClient");
exports.globalIO = null;
// Express and Socket.IO Setup
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: 'http://localhost:5173', // Frontend URL
            methods: ['GET', 'POST']
        }
    });
    // JWT Secret (store in environment variable)
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_jwt_secret';
    // Authentication Middleware
    const authenticateSocket = (socket, next) => {
        console.log('trigered by chat');
        const token = socket.handshake.auth.token;
        console.log('token', token);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
            console.log('token check :', decoded);
            socket.userId = decoded.id;
            // Fetch user's purchased courses via gRPC
            courseClient_1.CourseClient.FetchPurchasedCourses({ userId: decoded.id }, (err, response) => {
                if (err) {
                    return next(new Error('Authentication failed'));
                }
                socket.courseIds = response.courses.map((course) => course._id);
                console.log(socket.courseIds, 'courseIds');
                next();
            });
        }
        catch (error) {
            console.log('error occured', error);
            next(new Error('Authentication failed'));
        }
    };
    // Socket.IO Connection Handler
    io.use(authenticateSocket);
    io.on('connection', (socket) => {
        console.log('New client connected', socket.userId);
        socket.on('track_upload', (sessionId) => {
            socket.join(`${sessionId}`);
            console.log(`lets see = ${sessionId}`);
            console.log('joined track_upload socket', socket.userId);
        });
        socket.on('track_video_upload', (sessionId) => {
            console.log('/////////////////////////////1');
            // Verify user's right to upload
            if (socket.userId) {
                socket.join(`upload_${sessionId}`);
                console.log('joined track_video_upload', socket.userId);
            }
        });
        socket.on("get_chat_rooms", (userId, callback) => {
            console.log('trigered chat rooms', userId);
            chatClient_1.ChatClient.GetUserChatRooms(userId, (err, chatRooms) => {
                if (err) {
                    console.log(err, 'error fetching chat rooms');
                }
                console.log('calling back chat rooms', chatRooms);
                callback(chatRooms);
                socket.emit("chat_rooms", chatRooms);
            });
        });
        // Join Course Room 
        socket.on('join_course_room', ({ courseId, userId }) => {
            var _a;
            // Verify user is authorized for this course
            if ((_a = socket.courseIds) === null || _a === void 0 ? void 0 : _a.includes(courseId)) {
                socket.join(`course_${courseId}`);
                console.log(`User ${socket.userId} joined course room ${courseId}`);
            }
            const data = {
                courseId,
                userId,
                limit: 100,
                before: '',
            };
            console.log(data, 'this is data to fetch messages');
            chatClient_1.ChatClient.getMessages(data, (err, result) => {
                if (err) {
                    console.log(err, 'error fetching messages');
                    return;
                }
                console.log(result, 'result fetching messages');
                if (result) {
                    io.emit('course_messages', result.messages);
                }
            });
        });
        // Send Message
        socket.on('send_message', (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ courseId, content }, callback) {
            try {
                console.log('Triggered send message', courseId, content);
                // Fetch user details via gRPC
                userClient_1.UserClient.GetUserDetails({ userId: socket.userId }, (err, response) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a;
                    if (err) {
                        console.error('Error fetching user details:', err);
                        return callback({ error: 'Failed to fetch user details' });
                    }
                    const { firstName, lastName } = response.userData;
                    console.log(socket.courseIds, 'socket courseIds');
                    // Verify if the user is part of the course
                    if ((_a = socket.courseIds) === null || _a === void 0 ? void 0 : _a.includes(courseId)) {
                        const message = {
                            id: generateUniqueId(), // Replace with a proper ID generator
                            userId: socket.userId,
                            username: `${firstName} ${lastName}`,
                            content,
                            timestamp: new Date(),
                        };
                        // Broadcast message to the course room
                        console.log('Broadcasting to course room');
                        io.to(`course_${courseId}`).emit('new_message', message);
                        // Save message to database
                        try {
                            const savedMessage = yield saveMessageToChatService(message, courseId);
                            callback({ success: savedMessage, message, courseId }); // Return saved message to client
                        }
                        catch (dbError) {
                            console.error('Error saving message to database:', dbError);
                            callback({ error: 'Failed to save message' });
                        }
                    }
                    else {
                        callback({ error: 'User not part of this course' });
                    }
                }));
            }
            catch (error) {
                console.error('Error in send_message event:', error);
                callback({ error: 'An unexpected error occurred' });
            }
        }));
        // Helper function to save message (to be implemented with gRPC chat service)
        const saveMessageToChatService = (message, courseId) => {
            return new Promise((resolve, reject) => {
                console.log('trig save message to chat service');
                const data = Object.assign(Object.assign({}, message), { courseId });
                console.log('message: ', message);
                console.log(courseId, "courseId;");
                chatClient_1.ChatClient.SaveMessage(data, (err, result) => {
                    if (err) {
                        console.error('Error saving message:', err);
                        reject(err);
                    }
                    else {
                        console.log(result, 'response');
                        resolve(result.success);
                    }
                });
            });
        };
        // Helper function to generate unique ID
        const generateUniqueId = () => {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        };
        exports.globalIO = io;
        return io;
    });
};
exports.setupSocket = setupSocket;
//# sourceMappingURL=socketServer.js.map