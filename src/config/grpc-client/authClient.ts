import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import  dotenv from "dotenv"

dotenv.config()


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/auth.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const AuthService = grpc.loadPackageDefinition(packageDefinition).AuthService as grpc.ServiceClientConstructor;

const AuthClient   = new AuthService(
    `0.0.0.0:${process.env.AUTH_GRPC_PORT}`,grpc.credentials.createInsecure()
);

export{AuthClient};
 