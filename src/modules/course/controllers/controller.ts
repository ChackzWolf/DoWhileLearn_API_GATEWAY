import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import { ServiceError } from "@grpc/grpc-js";
import { StatusCode } from "../../../interface/enums";
import { UserClient } from "../../../config/grpc-client/userClient";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { ChatClient } from "../../../config/grpc-client/chatClient";
import { TranscoderClient } from "../../../config/grpc-client/TranscoderClient";
import { globalIO, setupSocket } from "../../../socket/socketServer";


// Configure multer for file handling
const videoStorage = multer.memoryStorage(); // Store file in memory for video
const imageStorage = multer.memoryStorage(); // Store file in memory for image

const uploadVideo = multer({ storage: videoStorage }).single('videoBinary'); // 'videoBinary' is the field name for video
const uploadImage = multer({ storage: imageStorage }).single('image'); // 'image' is the field name for image

export default class CourseController {
    // Constructor to bind methods
    constructor() {
        // Binding the method to the class instance
        this.UploadVideo = this.UploadVideo.bind(this);
        this.UploadImage = this.UploadImage.bind(this);
    }

    // Endpoint handler for video upload
    public UploadVideo(req: Request, res: Response, next: NextFunction): void {
      const sessionId = `upload_${Date.now()}_${req.body.tutorId}`;
        uploadVideo(req, res, (err: any) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).send(err.message);
            }
               
            // Check if file is available
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }

            console.log('Received file:', req.file);
            console.log(req.body,'req.body')

            // Create a data object for gRPC call
            const data = {
                file: req.file.buffer,  
                originalname:req.file.originalname,
                tutorId: req.body.tutorId 
            };

            const call = TranscoderClient.UploadFile(data) 
            call.on('data', (response:any) => {
              if(globalIO){
                console.log('ehh')
                globalIO.to(`upload_${sessionId}`).emit('upload_progress', {
                  sessionId,
                  status: response.status,
                  progress: response.progress
              });
              }
              console.log(`Status: ${response.status}`);
              console.log(`Message: ${response.message}`);
              console.log(`Progress: ${response.progress}%`);
              if(response.status == 'Completed'){
                console.log(`VideoURL: ${response.videoURL}`)
              }
              
            });

            call.on('end', () => {
                console.log('Transcoding process finished.');
            });

            call.on('error', (err:any) => {
                console.error('Error occurred:', err.message);
            });

             //, (err: ServiceError | null, result: any) => {
                // if (err) {
                //     console.error('gRPC error:', err);
                //     res.status(500).send(err.message);
                // } else {
                //     console.log(result);
                //     res.status(200).json(result);
                // }
           // });
        });
    } 
 
 
    // public UploadVideo(req: Request, res: Response, next: NextFunction): void {
    //     console.log('reached the transcoder here.', req)
    //     const { tutorId } = req.body;

    //     // Check if file is available


    //     console.log('Received file:', req.file);
    //     // Create a data object for gRPC call
    //     if (req.file) {
    //         const data = {
    //             file: req.file.buffer,
    //             tutorId
    //         };

    //         TranscoderClient.UploadFile(data, (err: ServiceError | null, result: any) => {
    //             if (err) {
    //                 console.error('gRPC error:', err);
    //                 res.status(500).send(err.message);
    //             } else {
    //                 console.log(result, ' result from transcoder service.');
    //                 res.status(200).json(result);
    //             }
    //         });
    //     }
    // }

    // Endpoint handler for image upload
    UploadImage(req: Request, res: Response, next: NextFunction): void {

        uploadImage(req, res, async (err: any) => {
          if (err) {
            console.error('Multer error:', err);
            return res.status(500).send('Error uploading file: ' + err.message);
          }
          // Check if file is uploaded
          if (!req.file) {
            return res.status(400).send('No file uploaded');
          }
          // Check if image name is provided
          if (!req.file.originalname) { 
            return res.status(400).send('Image name is required');
          }
          // Prepare data for gRPC request
          const data = {
            imageBinary: req.file.buffer,
            imageName: req.file.originalname,
          }; 
          console.log(data, 'datajj')
          // Call gRPC service
          CourseClient.UploadImage(data, (err: ServiceError | null, result: any) => {
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
      };  




      // Uploading a new course
      SubmitCourse(req:Request, res:Response, next: NextFunction) {
        console.log('trig')
        const data = req.body;
        const {tutorId} = req.body;
        console.log(data, ' data,,,');
        CourseClient.SubmitCourse(req.body, (err: ServiceError | null, result: any) => {
          console.log(JSON.stringify(req.body, null, 2));
          if (err) {
            console.error('gRPC error:', err);
            return res.status(500).send('Error from gRPC service: ' + err.message);
          }
          
          console.log(result); 
          if(result.success){

            const {courseId, courseTitle, thumbnail} = result
          
            const data = {
              tutorId ,
              courseId 
            }
            console.log('heading to tutorClient', data)
            TutorClient.AddCourseToTutor(data, (err: ServiceError | null, tutorResult: any) => {
              if(err){ // Rollbacking if error
                console.error('gRPC error from tutor:', err);
                  CourseClient.DeleteCourse(data, (err:ServiceError | null, DeleteCourseResult:any)=> {
                  const response ={
                    success: false,
                    message: 'Course create failed'
                  }
                  res.status(200).json(response);
                })
              }   
              if(!tutorResult.success){ // Rollbacking if not success 
                console.log('tutor update was not success');
                const data = {
                  courseId
                }
                CourseClient.DeleteCourse(data, (err:ServiceError | null, DeleteCourseResult:any)=> {
                  const response ={
                    success: false,
                    message: 'Course create failed'
                  }
                  res.status(200).json(response);
                })
              } 
              console.log(courseId, 'courseId')
              ChatClient.CreateChatRoom({courseId,courseName:courseTitle,thumbnail,tutorId}, (err:Error|null, ChatRoomResult:any)=>{
                console.log(ChatRoomResult, 'created chatroom')
              })
              res.status(200).json(result);
            });
          }else{
            res.status(200).json(result);
          }
          
        }) 
      }  


      EditCourseDetails(req:Request, res:Response, next:NextFunction){
        console.log('trig', req.body)
        console.log(JSON.stringify(req.body, null, 2));

        CourseClient.EditCourse(req.body, (err:ServiceError | null, result: any) => {
          if (err) {
            console.error('gRPC error:', err);
            return res.status(500).send('Error from gRPC service: ' + err.message);
          }
          console.log(result); 
          res.status(200).json(result);
        }) 
      } 

      FetchCourse(req:Request, res:Response, next: NextFunction) {
        console.log('trig23') 
        CourseClient.FetchCourse(req.body, (err: ServiceError | null, result: any) => {
          if(err){
            console.error("gRPC error:", err);
            return res.status(500).send("Error from gRPC service:" + err.message);
          }
          console.log(result)
          res.status(200).json(result);
        })
      } 

      FetchCourseDetails(req:Request, res:Response, next: NextFunction){
        console.log('trig25')
        const id = req.query.id as string; 
        const userId = req.query.userId as string;

        CourseClient.FetchCourseDetails({id}, (err:ServiceError | null,  result: any) => {
          if(err){
            console.log(err)
            return res.status(500).send("Error from grpc servcie:"+ err.message);
          }
          const courseData = result;
          console.log(JSON.stringify(courseData, null, 2))
          console.log(result)
          if(userId){
            console.log('have userId:' , userId);
            const data = {
              userId,
              courseId:id  
            } 

            UserClient.CourseStatus(data, (err:ServiceError | null, result: any) => {
              console.log(result, 'course status')
              res.status(StatusCode.OK).json({courseData,courseStatus:result});
            })
          }else{
            console.log('dont have userId ')
            const courseStatus = {
              inCart:false,
              inPurchase:false,
              inWishList:false
            }
            console.log(courseStatus);
            
            res.status(StatusCode.OK).json({courseData,courseStatus});
          }
          
        })
      }
}
