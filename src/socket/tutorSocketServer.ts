
// import { Server, Socket } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import { ChatClient } from '../config/grpc-client/chatClient';
// import { UserClient } from '../config/grpc-client/userClient';
// import { CourseClient } from '../config/grpc-client/courseClient';

// // Interfaces
// interface AuthenticatedSocket extends Socket {
//     userId?: string;
//     courseIds?: string[];
// }

// export let globalIO :Server| null = null

// // Express and Socket.IO Setup
// export const setupSocket = (server: any) => {
//     const io = new Server(server, {
//         cors: {
//             origin: 'http://localhost:5173', // Frontend URL
//             methods: ['GET', 'POST']
//         }
//     });

//     // JWT Secret (store in environment variable)
//     const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_jwt_secret';

//     // Authentication Middleware
//     const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
//         console.log('trigered by chat')
//         const token = socket.handshake.auth.token;
//         console.log('token', token)
//         try {
//             const decoded: any = jwt.verify(token, REFRESH_TOKEN_SECRET);
//             console.log('token check :', decoded)
//             socket.userId = decoded.id;

//             // Fetch user's purchased courses via gRPC
//             CourseClient.FetchPurchasedCourses({ userId: decoded.id },
//                 (err: Error | null, response: any) => {
//                     if (err) {
//                         return next(new Error('Authentication failed'));
//                     }
 
//                     socket.courseIds = response.courses.map((course: any) => course._id)
//                     console.log(socket.courseIds, 'courseIds')
//                     next();
//                 }
//             );
//         } catch (error) {
//             console.log('error occured', error);
//             next(new Error('Authentication failed'));
//         }
//     }; 

//     // Socket.IO Connection Handler
//     io.use(authenticateSocket);

//     io.on('connection', (socket: AuthenticatedSocket) => {
//         console.log('New client connected', socket.userId);


//         socket.on('track_upload', (sessionId) => {
//             socket.join(`upload_${sessionId}`);
//         });
//         socket.on('track_video_upload', (sessionId) => {
//             // Verify user's right to upload
//             if (socket.userId) {
//               socket.join(`upload_${sessionId}`);
//             }
//         });









//         socket.on("get_chat_rooms", (userId,callback)=> {
//             console.log('trigered chat rooms',userId)
//             ChatClient.GetUserChatRooms(userId, (err:Error | null, chatRooms:any)=>{
//                 console.log(chatRooms,'chat rooms')
//                 console.log('calling back chat rooms', chatRooms)
//                 callback(chatRooms);
//                 socket.emit("chat_rooms", chatRooms);
//             })


//         }) 

//         // Join Course Room
//         socket.on('join_course_room', ({ courseId,userId }) => {
//             // Verify user is authorized for this course
//             if (socket.courseIds?.includes(courseId)) { 
//                 socket.join(`course_${courseId}`); 
//                 console.log(`User ${socket.userId} joined course room ${courseId}`);
//             }
//             const data = {
//                 courseId,
//                 userId,
//                 limit: 100,
//                 before: '', 
//             }

//             ChatClient.getMessages(data, (err: Error | null, result: any) => {
//                 console.log(result, 'result fetching messages');
//                 if (result) {
//                     io.emit('course_messages', result.messages);
//                 }
//             })
//         });

//         // Send Message
//         socket.on('send_message', async ({ courseId, content }, callback) => {
//             try {
//               console.log('Triggered send message', courseId, content);
          
//               // Fetch user details via gRPC
//               UserClient.GetUserDetails({ userId: socket.userId }, async (err:Error, response:any) => {
//                 if (err) {
//                   console.error('Error fetching user details:', err);
//                   return callback({ error: 'Failed to fetch user details' });
//                 }
           
//                 const { firstName, lastName } = response.userData;
//                 console.log(socket.courseIds, 'socket courseIds');
          
//                 // Verify if the user is part of the course
//                 if (socket.courseIds?.includes(courseId)) {
//                   const message = {
//                     id: generateUniqueId(), // Replace with a proper ID generator
//                     userId: socket.userId,
//                     username: `${firstName} ${lastName}`,
//                     content,
//                     timestamp: new Date(),
//                   };
          
//                   // Broadcast message to the course room
//                   console.log('Broadcasting to course room');
//                   io.to(`course_${courseId}`).emit('new_message', message);
          
//                   // Save message to database
//                   try {
//                     const savedMessage = await saveMessageToChatService(message, courseId);
//                     callback({success:savedMessage,message,courseId}); // Return saved message to client
//                   } catch (dbError) {
//                     console.error('Error saving message to database:', dbError);
//                     callback({ error: 'Failed to save message' });
//                   }
//                 } else {
//                   callback({ error: 'User not part of this course' });
//                 }
//               });
//             } catch (error) {
//               console.error('Error in send_message event:', error);
//               callback({ error: 'An unexpected error occurred' });
//             }
//           });
          

//     // Helper function to save message (to be implemented with gRPC chat service)
//     const saveMessageToChatService = (message: any, courseId: string): Promise<any> => {
//         return new Promise((resolve, reject) => {
//             console.log('trig save message to chat service');
    
//             const data = {
//                 ...message,
//                 courseId,
//             };
    
//             console.log('message: ', message);
//             console.log(courseId, "courseId;");
    
//             ChatClient.SaveMessage(data, (err: Error | null, result: any) => {
//                 if (err) {
//                     console.error('Error saving message:', err);
//                     reject(err);
//                 } else {
//                     console.log(result, 'response');
//                     resolve(result.success);
//                 }
//             });
//         });
//     };
    

//     // Helper function to generate unique ID
//     const generateUniqueId = (): string => {
//         return Date.now().toString(36) + Math.random().toString(36).substr(2);
//     };
//     globalIO = io;
//     return io;
// }
//     )}
