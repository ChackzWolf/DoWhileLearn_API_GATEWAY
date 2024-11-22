import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
interface ChatMessage {
    userId: string;
    text: string;
    courseId?: string;  
  }
  
// Global io variable to access the socket instance
let io: Server;

// Function to initialize the socket connection
export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173', 
            methods: ['POST', 'GET'],
            credentials: true,
        },
        allowEIO3:true,
    });

    // Main connection logic
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        //joining a room for a particular course
        socket.on('joinRoom', async(courseId) => {
            console.log(`User ${socket.id} joined room ${courseId}`);
            socket.join(courseId);

            //fetch existing messages for  the course from database
            const previousMessage:any = ""// loading previouse messages with cousrse id.
            console.log('bla blb bla bla ',previousMessage)
            //const messagesWithUserDetails = await Promise.all(previousMessage.result.map(async (msg: any) => {
                //add details to each messages with user id
                // const userInfo: any = await userRabbitMqClient.produce(msg.userId, 'getUserDetails');
                // return {
                //     ...msg,
                //     userName: `${userInfo.user.firstName} ${userInfo.user.lastName} `,
                //     profilePicture: userInfo.user.profilePicture || ""
                // };
          //  }));
       // console.log('messageWithUserDetails',messagesWithUserDetails)
       // socket.emit('loadPreviousMessages',messagesWithUserDetails)
        });
 
        socket.on('leaveRoom', (courseId) => {
            console.log(`User ${socket.id} left room ${courseId}`);
            socket.leave(courseId);
        });

        // Listener for 'sendMessage' event from client
        socket.on('sendMessage', async({ courseId, message }: { courseId: string, message: ChatMessage & { id: string } }) => {
            console.log(message,courseId);
            try{
                const saveMessage ="" // saving message to chat service await  chatRabbitMqClient.produce(message,'save-message');
                console.log('message saving is',saveMessage)
                // Emit the message to the correct course room
                console.log('sssssss',message)

                const userInfo:any= ""// GETING USER DETAILS await userRabbitMqClient.produce(message.userId,'getUserDetails');
                console.log("user details from message",message.text,'==',userInfo.user)
                const messageWithUserDetails ={
                    ...message,
                    userName:`${userInfo.user.firstName} ${userInfo.user.lastName}`,
                    profilePicture:userInfo.user.profilePicture
                }
                
                io.to(courseId).emit('receiveMessage', { courseId, ...messageWithUserDetails });
            }catch(error){
                console.log("Error in chat",error);
                socket.emit('error', { message: 'Error processing the chat message' });               
            }
           
        });





        // socket.on('sendImage', async ({ courseId, imageMessage }: { courseId: string; imageMessage: { userId: string; image: string } }) => {
        //     try {
        //       // Save image message (optional, depending on requirements)
        //       const saveImageMessage = await chatRabbitMqClient.produce(imageMessage, 'save-image-message');
          
        //       // Get user details for the message
        //       const userInfo: any = await userRabbitMqClient.produce(imageMessage.userId, 'getUserDetails');
          
        //       const imageMessageWithUserDetails = {
        //         ...imageMessage,
        //         userName: userInfo.user.name,
        //         profilePicture: userInfo.user.profilePicture,
        //       };
          
        //       // Emit image message to the course room
        //       io.to(courseId).emit('receiveMessage', { courseId, ...imageMessageWithUserDetails });
        //     } catch (error) {
        //       console.log("Error in sending image", error);
        //       socket.emit('error', { message: 'Error processing the image message' });
        //     }
        //   });
          

        
          

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
