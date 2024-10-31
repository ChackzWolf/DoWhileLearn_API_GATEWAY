import { Request, Response, NextFunction } from "express";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { StatusCode } from "../../../interface/enums";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import createToken from "../../../utils/tokenActivation"
import multer from "multer";

const imageStorage = multer.memoryStorage(); // Store file in memory for image
const pdfStorage = multer.memoryStorage(); // Store PDF file in memory

const uploadImage = multer({ storage: imageStorage }).single('image'); // 'image' is the field name for image
const uploadPDF = multer({ storage: pdfStorage }).single('pdf'); // 'pdf' is the field name for the PDF

export default class TutorController {  

    constructor() {
        // Binding the method to the class instance
        this.UploadImage = this.UploadImage.bind(this);
        this.UploadPDF = this.UploadPDF.bind(this);
    }
    public UploadImage(req: Request,res :Response, next: NextFunction){
        console.log(req.body, "trig image");
        uploadImage(req, res, async (err: any) => {
            console.log('1' , req)
            
          if (err) {
            console.error('Multer error:', err);
            return res.status(500).send('Error uploading file: ' + err.message);
          }
          console.log('2')
          // Check if file is uploaded
          if (!req.file) {
            return res.status(400).send('No file uploaded');
          }
          console.log('3')
          // Check if image name is provided
          if (!req.file.originalname) {
            return res.status(400).send('Image name is required');
          }
          console.log('4')
          // Prepare data for gRPC request
          const data = {
            imageBinary: req.file.buffer,
            imageName: req.file.originalname,
          };
          console.log(data, 'kkkkkkkkkkk')
          // Call gRPC service
          TutorClient.UploadImage(data, (err: ServiceError | null, result: any) => {
            if (err) {
              console.error('gRPC error:', err);
              return res.status(500).send('Error from gRPC service: ' + err.message);
            }
      
            // Retrieve and validate the public URL from gRPC response
            const {s3Url, success, message} = result
            console.log(result)
            console.log(s3Url, success, message); 
            if (!success) { 
              return res.status(500).send('Failed to get image URL from gRPC service');
            }
            // Send the public URL back in the response
            res.status(200).json({s3Url, success, message});
          });
        });
    }

    public UploadPDF(req: Request, res: Response, next: NextFunction) {
        console.log(req.body, "trig data form pdf");
        uploadPDF(req, res, async (err: any) => {
            console.log('1', req);
            
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).send('Error uploading file: ' + err.message);
            }
            console.log('2');

            // Check if PDF is uploaded
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }
            console.log('3');

            // Check if PDF name is provided
            if (!req.file.originalname) {
                return res.status(400).send('PDF name is required');
            }
            console.log('4');

            // Prepare data for gRPC request
            const data = {
                pdfBinary: req.file.buffer,
                pdfName: req.file.originalname,
            };
            console.log(data, 'kkkkkkkkkkk'); 

            // Call gRPC service for PDF upload
            TutorClient.UploadPDF(data, (err: ServiceError | null, result: any) => {
                if (err) {
                    console.error('gRPC error:', err);
                    return res.status(500).send('Error from gRPC service: ' + err.message);
                }

                // Retrieve and validate the public URL from gRPC response
                const { s3Url, success, message } = result;
                console.log(result);
                console.log(s3Url, success, message);
                if (!success) {
                    return res.status(500).send('Failed to get PDF URL from gRPC service');
                }

                // Send the public URL back in the response
                res.status(200).json({ s3Url, success, message });
            });
        });
    }


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

            const {success, message, tutorData, tutorId} = result
            if (err) {  
                console.error("Error verifying OTP:", err); 
                return res.status(500).send(err.message);  // Return early if there's an error
            }
      
            if (success) {   
                const {refreshToken, accessToken} = createToken(tutorData,"TUTOR"); 
    
                res.status(200).json({ success: true, message: "OTP verified successfully." , refreshToken, accessToken, id:tutorData._id,tutorId, tutorData});
            } else {
                res.status(400).json({ success: false, message: "Invalid OTP response." });
            }
        })
    }
 
    resendOtp(req:Request, res:Response, next:NextFunction){
        console.log('triggered resend otp tutor')
        TutorClient.ResendOTP(req.body, (err: ServiceError | null, result: any) =>{
            console.log('result:', result)
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
                        console.log(tutorData, 'tutor data')
                    const {refreshToken, accessToken} = createToken(tutorData, "TUTOR")
                    res.cookie('refreshToken', refreshToken, { 
                        httpOnly: true,  
                        secure: true, // Make sure to use 'secure' in production with HTTPS
                        sameSite: 'strict' 
                    });
                    res.status(StatusCode.Created).send({message, success, accessToken, refreshToken,tutorId:tutorData._id, tutorData});
                }else{
                    // Handle failed login cases
                    if(result.message === 'isBlocked'){
                        console.log('here')
                        return res.status(403).json({ message: 'user blocked' });
                    }

                    console.log('reached her')
                    return res.status(StatusCode.Created).json({ success: false, message: "Login failed. Invalid credentials." });
            
                }
            }
            
        })
    }

    FetchTutorCourse(req:Request, res:Response, next: NextFunction) {
        console.log('trig')
        const tutorId = req.query.tutorId as string;
        CourseClient.FetchTutorCourse({tutorId}, (err: ServiceError | null, result: any) => {
          if(err){
            console.error("gRPC error:", err);
            return res.status(500).send("Error from gRPC service:" + err.message);
          }

          res.status(StatusCode.OK).json(result);
        })
    }

    fetchTutorDetails(req:Request, res:Response, next: NextFunction) {
        console.log("Trig fetch course")
        const tutorId = req.query.tutorId as string;
        TutorClient.FetchTutorTutor({tutorId}, (err: ServiceError | null, result: any) => {
            if(err){
            console.error("gRPC error:", err);
            return res.status(500).send("Error from gRPC service:" + err.message);
          }

          res.status(StatusCode.OK).json(result);
        })
    }
    

    sendOtpToEmail(req: Request, res: Response, next: NextFunction){
        console.log('tutor trig',req.body)
        TutorClient.SendOtpToEmail(req.body, (err:ServiceError | null, result: any)=> {
            console.log(result, 'of tutor send  otp result')
            res.status(StatusCode.OK).json(result);
        })
    }
    resetPasswordOTP(req: Request, res: Response, next: NextFunction){ 
        console.log('trig')
        TutorClient.VerifyOTPResetPassword(req.body, (err:ServiceError | null, result: any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        });
    } 

    resetPassword(req: Request, res: Response, next: NextFunction){
        console.log(req.body,'trig')
        TutorClient.ResetPassword(req.body,(err:ServiceError | null, result:any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
         
    }
    
    registerDetails(req: Request, res: Response, next: NextFunction){
        console.log(req.body, 'details')
        TutorClient.RegistrationDetails(req.body,(err:ServiceError | null, result:any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }

    resendPasswordOTP(req:Request, res: Response, next: NextFunction) {
        console.log(req.body, 'trig from resend otp');
        TutorClient.ResendOtpToEmail(req.body, (err:ServiceError | null, result: any)=> {
            console.log(result)
            res.status(StatusCode.OK).json(result);
        })
    }
    
}    