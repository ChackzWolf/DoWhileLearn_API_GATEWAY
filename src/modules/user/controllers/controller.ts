import { Request, Response, NextFunction } from "express";
import { UserClient } from "../../../config/grpc-client/userClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import jwt, {VerifyErrors} from 'jsonwebtoken'
import { PaymentClient } from "../../../config/grpc-client/paymentClient";
import { CourseClient } from "../../../config/grpc-client/courseClient";


export default class UserController {  

    register(req: Request, res: Response, next: NextFunction) {
        UserClient.Register(req.body, (err: ServiceError | null, result: any) => {
            console.log('triggered api')
       
            console.log(result)
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            } else {
                res.status(200).json(result); 
            }
        });  
    }  

    verifyOtp(req: Request, res: Response, next: NextFunction): void {
        UserClient.VerifyOTP(req.body, (err: ServiceError | null, result: any) => {
            const {message, success, accessToken, refreshToken} = result;
            if (err) {
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message);  // Return early if there's an error
            }
    
            if (success) {
                res.status(200).json({ success: true, message: "OTP verified successfully.", accessToken, refreshToken });
            } else {
                res.status(400).json({ success: false, message});
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

    userLogin (req:Request, res:Response, next:NextFunction){ 
        UserClient.UserLogin(req.body, (err: ServiceError | null, result: any) =>{
       
            if(err){
                res.status(500).send(err.message);
            }else{
                if(result.success){
                    const {message, success, accessToken,refreshToken ,userId} = result;
                    console.log(result)
                    res.status(StatusCode.Created).send({message, success, accessToken, refreshToken , userId});
                }
            } 
        })
    }
 

    refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken; // Get the refresh token from cookies
    
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }
    
        // Correct callback usage
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err: VerifyErrors | null, decoded :any | null) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            if (!decoded) {
                return res.status(403).json({ message: 'No user data in token' });
            }
    
            // Generate a new access token
            const accessToken = jwt.sign(
                { id: decoded.id, email: decoded.email },
                process.env.JWT_SECRET as string,
                { expiresIn: '15m' } 
            ); 
             
            res.json({ accessToken });
        });
    }

    addToCart(req: Request, res: Response, next:NextFunction){
        UserClient.AddToCart(req.body, (err: ServiceError | null, result: any) =>{ 
            
            console.log(result, 'result');
            const {success, message, inCart} = result;
            if(success)(
                res.status(StatusCode.Created).send({message,success, inCart})
            )  
        }); 
    }
    makePayment(req:Request, res:Response, next:NextFunction) {
        PaymentClient.PurchasePayment(req.body, (err: ServiceError | null, result: any) => {
            console.log(result, 'result');
            if(result.session_id) {
                res.status(StatusCode.Created).send({session_id :result.session_id});
            }
        })
    }

    getCartItems(req:Request, res:Response, next:NextFunction) {
        console.log('trug')
        const userId = req.query.userId as string;
        UserClient.GetCartItemsIds({userId}, (err: ServiceError | null, GetIdsResult: any) => {
            if(err){
              console.error("gRPC error:", err);
              return res.status(500).send("Error from gRPC service:" + err.message);
            }
            console.log(GetIdsResult, 'thsi is ersult for m  Getcartitems');
            const {success, courseIds} = GetIdsResult
            if(success){
                CourseClient.GetCourseInCart({courseIds}, (err: ServiceError | null, result: any) => {
                    if(err){
                        console.error("gRPC error:", err);
                        return res.status(500).send("Error from gRPC service:" + err.message);
                    }
                    console.log(result)
                    res.status(StatusCode.OK).send(result);
                });
            }else{
                return {success:false}
            }
        })
    }


}  