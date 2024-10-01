import { Request, Response, NextFunction } from "express";
import { OrderClient } from "../../../config/grpc-client/orderClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import { PaymentClient } from "../../../config/grpc-client/paymentClient";




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
                console.log(result) 
                const orderData = result;
                OrderClient.createOrder( orderData, (err: ServiceError | null, result: any) => {
                    console.log('triggered api create order')
                    if (err) {
                        console.error(err);
                        res.status(500).send(err.message);
                    } else {
                        console.log(result) 
                        res.status(200).json(result);
                    }
                }); 
                res.status(200).json(result);
            } 
        })
    }
}  