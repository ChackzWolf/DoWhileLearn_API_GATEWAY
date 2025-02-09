import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader"; 
import  dotenv from "dotenv"

dotenv.config()


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/admin.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const AdminService = grpc.loadPackageDefinition(packageDefinition).AdminService as grpc.ServiceClientConstructor;

const AdminClient   = new AdminService(
    `admin-service.dowhilelearn.svc.cluster.local:${process.env.ADMIN_SERVICE_PORT}`,grpc.credentials.createInsecure()
);

export{AdminClient};
 