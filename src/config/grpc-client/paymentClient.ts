import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import  dotenv from "dotenv"

dotenv.config()


const packageDefinition = protoLoader.loadSync(path.join(__dirname,"../proto/Payment.proto"), {
    keepCase: true,
    longs: String,
    enums: String, 
    defaults: true, 
    oneofs: true
}); 

const PaymentService = grpc.loadPackageDefinition(packageDefinition).PaymentService as grpc.ServiceClientConstructor;
 
const PaymentClient   = new PaymentService(
    `payment-service.dowhilelearn.svc.cluster.local:${process.env.PAYMENT_SERVICE_PORT}`,grpc.credentials.createInsecure(),
    {
        'grpc.max_send_message_length': 1 * 1024 * 1024 * 1024, // 1 GB
        'grpc.max_receive_message_length': 1 * 1024 * 1024 * 1024 // 1 GB
    }
);

export{PaymentClient};
  