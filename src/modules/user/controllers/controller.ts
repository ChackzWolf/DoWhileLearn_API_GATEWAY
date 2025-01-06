import { Request, Response, NextFunction } from "express";
import { UserClient } from "../../../config/grpc-client/userClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
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
            const {message, success, accessToken, refreshToken, userId} = result;
            if (err) {
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message);  // Return early if there's an error
            }
    
            if (success) {
                res.status(200).json({ success: true, message: "OTP verified successfully.", accessToken, refreshToken, userId });
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

    userLogin(req: Request, res: Response, next: NextFunction) { 
        console.log('trig user login')
        UserClient.UserLogin(req.body, (err: ServiceError | null, result: any) => {
            if (err) {
                console.error("Login error:", err.message);
                return res.status(500).send({ success: false, message: "Internal server error" });
            }
            console.log(result, 'result form user') 
            if (result && result.success) {
                const { message, success, accessToken, refreshToken, userId, userData } = result;
                console.log(result)
                if (success && refreshToken && accessToken) {
    
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
                    return res.status(201).json({ message, success, userId , accessToken, refreshToken, userData});
                } else {
                    return res.status(201).json({ success: false, message: result.message });
                }
            } else {
                // Handle failed login cases
                if(result.message === 'isBlocked'){
                    return res.status(403).json({ message: 'user blocked' });
                }
                return res.status(StatusCode.NotAcceptable).json({ success: false, message: result.message });
            }
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
            if(result) {
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
                CourseClient.GetCourseByIds({courseIds}, (err: ServiceError | null, result: any) => {
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


    clearCookie(req:Request, res:Response, next:NextFunction) {
        console.log('trig clearCookie')

        // res.cookie('refreshToken', '', { maxAge: 0, path: '/', httpOnly: true, secure: true });

        res.clearCookie('refreshToken', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        console.log(req.cookies.refreshToken,'removed cookie')
        res.status(200).send({message:'Logged out',success:true});
    }

    fetchUserDetails(req:Request, res:Response, next: NextFunction){
        try {

            console.log(req.params, 'req.parama')
            const {userId} = req.query
            UserClient.GetUserDetails({ userId: userId }, (err:ServiceError | null , result:any)=> {
                if(err){
                    console.log(err)
                    return res.status(500).send("Error from grpc servcie:"+ err.message);
                }
                console.log(result, 'result from fetching')
                res.status(StatusCode.OK).json({result});

            })
        } catch (error) {
            
        } 
    }

    updateUserDetails(req:Request, res:Response, next: NextFunction){
        try {
            const formData = req.body; 
            console.log(formData, ' this is form data for user details update')
            UserClient.UpdateUserDetails({formData}, (err:ServiceError | null, result: any)=> {
                if(err){
                    console.log(err)
                }
                console.log(result);
                res.status(StatusCode.OK).json(result);
            })
        } catch (error) {

        }
    }

    fetchCourseDetails(req:Request, res:Response, next: NextFunction){
        console.log('trig 22')
        const id = req.query.id as string; 
        const userId = req.query.userId as string;
        console.log(userId, '///////////////////////////////')
        CourseClient.FetchCourseDetails({id}, (err:ServiceError | null,  result: any) => {
          if(err){
            console.log(err)
            return res.status(500).send("Error from grpc servcie:"+ err.message);
          }
          const courseData = result;
          console.log('Raw course data:', JSON.stringify(courseData, null, 2));
          console.log('Raw course data structure:', Object.keys(courseData));

          console.log(result)
          if(userId){
            console.log('have user id:', userId);
            const data = {
              userId,
              courseId:id
            }

            UserClient.CourseStatus(data, (err:ServiceError | null, result: any) => { 
              console.log(result, 'course status')
              res.status(StatusCode.OK).json({courseData,courseStatus:result});
            })
          }else{
            console.log('dont have userId: ' , userId);
            res.status(StatusCode.OK).json({courseData,inCart:false});
          }
        }) 
    } 
    sendOtpToEmail(req: Request, res: Response, next: NextFunction){
        UserClient.SendOtpToEmail(req.body, (err:ServiceError | null, result: any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }

    resendPasswordOTP(req:Request, res: Response, next: NextFunction) {
        console.log(req.body, 'trig from resend otp');
        UserClient.ResendOtpToEmail(req.body, (err:ServiceError | null, result: any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }

    resetPasswordOTP(req: Request, res: Response, next: NextFunction){ 
        console.log('trig')
        UserClient.VerifyOTPResetPassword(req.body, (err:ServiceError | null, result: any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        });
    }

    resetPassword(req: Request, res: Response, next: NextFunction){
        console.log(req.body,'trig')
        UserClient.ResetPassword(req.body,(err:ServiceError | null, result:any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
         
    }

    addReview(req: Request, res:Response, next: NextFunction){
        console.log('triggered add review', req.body);
        CourseClient.AddReview(req.body,(err:ServiceError | null, result:any)=> {
            console.log(result, 'result from adding review');
            res.status(StatusCode.OK).json(result);
        })
    } 

    fetchReviewsOfCourse(req: Request, res:Response, next: NextFunction){
        console.log('triggered add review.', req.query.courseId);
        const courseId = req.query.courseId as string; 
        CourseClient.FetchReviewsOfCourse({courseId}, (err:ServiceError | null, result:any) =>{
            console.log(result);
            if(result){
                console.log('sending to user')
                UserClient.AttachNameToReview(result, (err:ServiceError | null, finalResult:any)=> {
                    console.log(finalResult, 'result by fetching  user name ');
                    res.status(StatusCode.OK).json(finalResult);
                })
            }

        })
    } 
 
    fetchPurchasedCourses(req: Request, res:Response, next: NextFunction) {
        console.log('triggered fetch purchased course');
        const userId = req.query.userId;
        CourseClient.FetchPurchasedCourses({userId}, (err: ServiceError | null, result:any)=>{
            console.log(result, 'fetched purchased course')
            res.status(StatusCode.OK).json(result);
        })
    }

     

}  