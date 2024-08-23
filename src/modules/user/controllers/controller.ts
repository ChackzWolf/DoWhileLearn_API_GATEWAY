import { Request, Response, NextFunction } from "express";
import { UserClient } from "../../../config/grpc-client/userClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError

export default class UserController {  

    register(req: Request, res: Response, next: NextFunction) {
        UserClient.Register(req.body, (err: ServiceError | null, result: any) => {
            console.log('triggered api')
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            } else {
                console.log(result) 
                res.status(200).json(result);
            }
        });
    }

    verifyOtp(req:Request, res:Response, next:NextFunction){
        UserClient.VerifyOTP(req.body,(err: ServiceError | null, result: any)=>{
            console.log(' trigger api ')
            if(err){
                console.error(err);
                res.status(500).send(err.message);
            }else {
                console.log(result)
                res.status(200).json(result)
            }
        }) 
    } 

    resendOtp(req:Request, res:Response, next:NextFunction){
        UserClient.ResendOTP(req.body, (err: ServiceError | null, result: any) =>{
            console.log('triggered resend api')
            if(err){
                console.log(err);
                res.status(500).send(err.message);
            }else{
                res.status(200).json(result);  
            }
        })
    }
} 