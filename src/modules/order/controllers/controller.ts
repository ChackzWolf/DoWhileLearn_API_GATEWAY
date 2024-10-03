import { Request, Response, NextFunction } from "express";
import { OrderClient } from "../../../config/grpc-client/orderClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import { PaymentClient } from "../../../config/grpc-client/paymentClient";
import { UserClient } from "../../../config/grpc-client/userClient";




export default class OrderController {  

    handlePaymentSuccess(req: Request, res: Response, next: NextFunction) {
        const sessionId  = req.query.sessionId;
        console.log(sessionId, 'section id')
        PaymentClient.SuccessPayment({sessionId}, (err: ServiceError | null, result: any) => {
            console.log('triggered api tutor')
            if (err) {   
                console.error(err);
                res.status(500).send(err.message); 
            } else {
                console.log(result, 'rsult from paymentClient.succespayment') 
                const orderData = result;
                OrderClient.CreateOrder( orderData, (err: ServiceError | null, result: any) => {
                    console.log('triggered api create order')
                    if (err) { 
                        console.error(err);
                        res.status(500).send(err.message);
                    } else {
                        console.log(result, ' this is result') 
                        const orderData = result
                        const data = {
                            userId: result.order.userId,
                            courseId: result.order.courseId
                        }
                        UserClient.AddPurchasedCourses(data,(err:ServiceError | null, result: any)=> {
                            console.log(result)
                            if (err) {
                                console.error(err);
                                res.status(500).send(err.message);
                            } else {
                                res.status(200).json(orderData);
                            }
                        })
                    }
                }); 
            } 
        })
    }
}  