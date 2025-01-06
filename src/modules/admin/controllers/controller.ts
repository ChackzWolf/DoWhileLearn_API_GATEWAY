import { Request, Response, NextFunction, response } from "express";
import { AdminClient } from "../../../config/grpc-client/adminClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import createToken from "../../../utils/tokenActivation";
import { UserClient } from "../../../config/grpc-client/userClient";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { OrderClient } from "../../../config/grpc-client/orderClient";




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
        AdminClient.Login(req.body, (err: ServiceError | null, result: any) =>{
            console.log(result , 'result ')
            
            if(err){
                res.status(500).send(err.message);  
            }else{
                const {message, success, adminData, refreshToken, accessToken } = result;
                if(success){
                    res.cookie('refreshToken', refreshToken, { 
                        httpOnly: true , 
                        secure: true,
                        sameSite: 'strict' 
                    });
                    res.status(StatusCode.Created).send({message, success, accessToken, refreshToken, _id:adminData._id});
                }
            }
            
        })
    }

    ToggleBlockStudent(req:Request, res: Response, nest: NextFunction){
        UserClient.ToggleBlock(req.body, (err:ServiceError | null, result:any)=> { 
            if(err){
                res.status(500).send(err.message);  
                return
            }
            res.status(StatusCode.Accepted).send(result);
        })
    }

    ToggleBlockTutor(req:Request, res: Response, nest: NextFunction){
        TutorClient.ToggleBlock(req.body, (err:ServiceError | null, result:any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            res.status(StatusCode.Accepted).send(result);
        })
    }

    FetchStudentData (req:Request, res:Response, next:NextFunction){
        console.log('triggerd fetsh students')
        UserClient.FetchStudentData(req.body, (err:ServiceError | null , result: any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            res.status(StatusCode.Created).send(result);
        })
    }

    fetchAllOrders(req:Request, res:Response, next: NextFunction){
        console.log('trigered fertch aall orders admin');
        OrderClient.FetchAllOrders({}, (err:ServiceError | null, result:any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            res.status(StatusCode.Accepted).send(result);
        })
    }

    FetchTutorData(req:Request, res: Response, next: NextFunction){
        console.log('trig fetch tutor')
        TutorClient.FetchTutorData(req.body, (err:ServiceError | null, result:any) => {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            res.status(StatusCode.Accepted).send(result)
        })
    }

    sendOtpToEmail(req: Request, res: Response, next: NextFunction){
        AdminClient.SendOtpToEmail(req.body, (err:ServiceError | null, result: any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }

    resetPasswordOTP(req: Request, res: Response, next: NextFunction){ 
        console.log('trig')
        AdminClient.VerifyOTPResetPassword(req.body, (err:ServiceError | null, result: any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            console.log(result)
            res.status(StatusCode.OK).json(result);
        });
    }

    resetPassword(req: Request, res: Response, next: NextFunction){
        console.log(req.body,'trig')
        AdminClient.ResetPassword(req.body,(err:ServiceError | null, result:any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }     
    resendPasswordOTP(req:Request, res: Response, next: NextFunction) {
        console.log(req.body, 'trig from resend otp');
        AdminClient.ResendOtpToEmail(req.body, (err:ServiceError | null, result: any)=> {
            if(err){
                res.status(500).send(err.message);  
                return
            }
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }
}   