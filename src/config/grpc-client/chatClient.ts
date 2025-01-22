import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader"; 
import  dotenv from "dotenv" 
 
dotenv.config()


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/chat.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const ChatService = grpc.loadPackageDefinition(packageDefinition).ChatService as grpc.ServiceClientConstructor;

const ChatClient = new ChatService(
    `0.0.0.0:${process.env.CHAT_SERVICE_PORT}`,grpc.credentials.createInsecure()
);

export{ChatClient};
  