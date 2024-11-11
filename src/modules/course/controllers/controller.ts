import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import { ServiceError } from "@grpc/grpc-js";
import { StatusCode } from "../../../interface/enums";
import { UserClient } from "../../../config/grpc-client/userClient";
import { TutorClient } from "../../../config/grpc-client/tutorClient";


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

            // Create a data object for gRPC call
            const data = {
                videoBinary: req.file.buffer, 
                // You might also include other fields if needed
            };

            CourseClient.UploadVideo(data, (err: ServiceError | null, result: any) => {
                if (err) {
                    console.error('gRPC error:', err);
                    res.status(500).send(err.message);
                } else {
                    console.log(result);
                    res.status(200).json(result);
                }
            });
        });
    }

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
          if (err) {
            console.error('gRPC error:', err);
            return res.status(500).send('Error from gRPC service: ' + err.message);
          }
          
          console.log(result); 
          if(result.success){

            const courseId = result.courseId;
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
              res.status(200).json(result);
            });
          }
          
        }) 
      }  


      EditCourseDetails(req:Request, res:Response, next:NextFunction){
        console.log('trig', req.body)
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
        console.log('trig')
        CourseClient.FetchCourse(req.body, (err: ServiceError | null, result: any) => {
          if(err){
            console.error("gRPC error:", err);
            return res.status(500).send("Error from gRPC service:" + err.message);
          }
 
          res.status(200).json(result);
        })
      }

      FetchCourseDetails(req:Request, res:Response, next: NextFunction){
        console.log('trig')
        const id = req.query.id as string; 
        const userId = req.query.userId as string;

        CourseClient.FetchCourseDetails({id}, (err:ServiceError | null,  result: any) => {
          if(err){
            console.log(err)
            return res.status(500).send("Error from grpc servcie:"+ err.message);
          }
          const courseData = result;
          console.log(result)
          if(userId){
            const data = {
              userId,
              courseId:id
            }

            UserClient.CourseStatus(data, (err:ServiceError | null, result: any) => {
              console.log(result, 'course status')
              res.status(StatusCode.OK).json({courseData,courseStatus:result});
            })
          }else{
            res.status(StatusCode.OK).json({courseData,inCart:false});
          }
          
        })
      }
}
