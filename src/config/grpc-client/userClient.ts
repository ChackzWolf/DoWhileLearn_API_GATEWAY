import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
 


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/user.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const UserService = grpc.loadPackageDefinition(packageDefinition).UserService as grpc.ServiceClientConstructor;

const UserClient   = new UserService(
    'localhost:4000',grpc.credentials.createInsecure()
);

export{UserClient};
