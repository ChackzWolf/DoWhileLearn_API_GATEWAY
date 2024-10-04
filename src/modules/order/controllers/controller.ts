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
            const orderData = paymentResult;

            // Handle order creation
            OrderClient.CreateOrder(orderData, async (err: ServiceError | null, orderResult: any) => {
                if (err) { 
                    console.error("Order creation error:", err);
                    return res.status(500).send(err.message);
                }

                console.log(orderResult, 'result from OrderClient.CreateOrder');
                const data = {
                    userId: orderResult.order.userId,
                    courseId: orderResult.order.courseId
                };
                const price = parseFloat(orderResult.order.price);
                const moneyToAdd = (price * 0.95).toFixed(2)
                console.log(moneyToAdd,'money to add tutor')
                const dataToTutor = {
                    tutorId: orderResult.order.tutorId,
                    userId: orderResult.order.userId,
                    tutorShare : moneyToAdd
                };

                // Concurrently execute the three functions
                try {
                    await Promise.all([
                        addPurchasedCourses(data), 
                        addPurchasedUsers(data),
                        addStudents(dataToTutor)
                    ]);

                    // Success response after all services complete
                    return res.status(200).json(orderResult);

                } catch (err) {
                    console.error("Error updating services:", err);
                    return res.status(500).json({ message: 'Error updating purchase records', error: err });
                }
            });
        });
    }
}
