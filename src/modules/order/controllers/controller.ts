import { Request, Response, NextFunction } from "express";
import { OrderClient } from "../../../config/grpc-client/orderClient";
import { ServiceError } from "@grpc/grpc-js";
import { PaymentClient } from "../../../config/grpc-client/paymentClient";
import { UserClient } from "../../../config/grpc-client/userClient";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { addPurchasedCourses, addPurchasedUsers, addStudents } from "./use.case";

export default class OrderController {  

    async handlePaymentSuccess(req: Request, res: Response, next: NextFunction) {
        const sessionId  = req.query.sessionId;
        console.log(sessionId, 'session id');

        // Handle payment success
        PaymentClient.SuccessPayment({ sessionId }, async (err: ServiceError | null, paymentResult: any) => {
            if (err) {   
                console.error("Payment error:", err);
                return res.status(500).send(err.message);  
            }

            console.log(paymentResult, 'result from PaymentClient.SuccessPayment');
        });
    }
}
