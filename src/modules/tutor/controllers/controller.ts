import { Request, Response, NextFunction } from "express";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import createToken from "../../../utils/tokenActivation";




export default class TutorController {  

    register(req: Request, res: Response, next: NextFunction) {
        TutorClient.Register(req.body, (err: ServiceError | null, result: any) => {
            console.log('triggered api tutor')
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            } else {
                console.log(result) 
                res.status(200).json(result);
            }
        }); 
    }

    verifyOtp(req: Request, res: Response, next: NextFunction): void {
        TutorClient.VerifyOTP(req.body, (err: ServiceError | null, result: any) => {
            console.log(result,'result') 

            const {success, message, tutorData} = result
            if (err) {  
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message);  // Return early if there's an error
            }
      
            if (success) {   
                const {refreshToken, accessToken} = createToken(tutorData,"TUTOR"); 
    
                res.status(200).json({ success: true, message: "OTP verified successfully." , refreshToken, accessToken});
            } else {
                res.status(400).json({ success: false, message: "Invalid OTP response." });
            }
        })
    }
 
    resendOtp(req:Request, res:Response, next:NextFunction){
        TutorClient.ResendOTP(req.body, (err: ServiceError | null, result: any) =>{
            console.log('triggered resend api')
            if(err){
                console.log(err); 
                res.status(500).send(err.message);
            }else{ 
                res.status(200).json(result);   
            }  
        })  
    }

    tutorLogin (req:Request, res:Response, next:NextFunction){
        TutorClient.Login(req.body, (err: ServiceError | null, result: any) =>{
            console.log(result , 'result ')
            const {message, success, tutorData} = result;
            if(err){
                res.status(500).send(err.message);  
            }else{
                if(success){
                    const {refreshToken, accessToken} = createToken(tutorData, "USER")
                    res.status(StatusCode.Created).send({message, success, accessToken, refreshToken});
                }
            }
            
        })
    }
}  