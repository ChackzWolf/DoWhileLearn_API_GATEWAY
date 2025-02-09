import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import  dotenv from "dotenv"
 
dotenv.config()


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/tutor.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const TutorService = grpc.loadPackageDefinition(packageDefinition).TutorService as grpc.ServiceClientConstructor;

const TutorClient   = new TutorService(
    `tutor-service.dowhilelearn.svc.cluster.local:${process.env.TUTOR_SERVICE_PORT}`,grpc.credentials.createInsecure()
);

export{TutorClient};
 