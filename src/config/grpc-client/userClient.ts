import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import  dotenv from "dotenv"

dotenv.config()


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/user.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const UserService = grpc.loadPackageDefinition(packageDefinition).UserService as grpc.ServiceClientConstructor;

const UserClient   = new UserService(
    `user-service.dowhilelearn.svc.cluster.local:${process.env.USER_SERVICE_URL}`,grpc.credentials.createInsecure()
);

export{UserClient};
