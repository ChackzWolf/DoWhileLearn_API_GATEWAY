import { Request, Response, NextFunction, response } from "express";
import { AdminClient } from "../../../config/grpc-client/adminClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import createToken from "../../../utils/tokenActivation";
import { UserClient } from "../../../config/grpc-client/userClient";




export default class AdminController {  
    verifyOtp(req: Request, res: Response, next: NextFunction): void {
        AdminClient.VerifyOTP(req.body, (err: ServiceError | null, result: any) => {
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
        AdminClient.ResendOTP(req.body, (err: ServiceError | null, result: any) =>{
            console.log('triggered resend api')
            if(err){
                console.log(err); 
                res.status(500).send(err.message);
            }else{ 
                res.status(200).json(result);   
            }  
        })  
    }

     Login (req:Request, res:Response, next:NextFunction){
        console.log('triggereed')
        AdminClient.Login(req.body, (err: ServiceError | null, result: any) =>{
            console.log(result , 'result ')
            const {message, success, adminData, refreshToken, accessToken } = result;
            if(err){
                res.status(500).send(err.message);  
            }else{

                if(success){
                    res.cookie('refreshToken', refreshToken, { 
                        httpOnly: true, 
                        secure: true, // Make sure to use 'secure' in production with HTTPS
                        sameSite: 'strict' 
                    });
                    res.status(StatusCode.Created).send({message, success, accessToken, refreshToken,_id:adminData._id});
                }
            }
            
        })
    }

    FetchStudentData (req:Request, res:Response, next:NextFunction){
        UserClient.FetchStudentData(req.body, (err:ServiceError | null , result: any)=> {
            console.log(result, 'result')
            const { message, success, studentsData} = result;
            
        })
    }
}  