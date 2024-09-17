import { Request, Response, NextFunction } from "express";
import { AuthClient } from "../../../config/grpc-client/authClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import createToken from "../../../utils/tokenActivation";




export default class AuthController {  

    isAuthenticated(req: Request, res: Response, _next: NextFunction) {
        AuthClient.IsAuthenticated(req.body, (err: ServiceError | null, result: any) => {
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

    refreshToken(req: Request, res: Response, _next: NextFunction): void {
        console.log("triggered refresh ",req)
        AuthClient.RefreshToken(req.body, (err: ServiceError | null, result: any) => {
            console.log(result,'resultdddd') 

            const {success, message, tutorData} = result
            if (err) {  
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message);  // Return early if there's an error
            }
      
            if (success) {   
                const {refreshToken, accessToken} = createToken(tutorData,"TUTOR"); 
                console.log("trig")
                res.status(200).json({ success: true, message: "OTP verified successfully." , refreshToken, accessToken});
            } else {
                res.status(400).json({ success: false, message: "Invalid OTP response." });
            }
        })
    }
}  