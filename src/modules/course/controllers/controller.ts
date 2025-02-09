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
  private queuedRequests: { req: Request; res: Response; next: NextFunction }[] = [];
  private currentJobInProgress: string | null = null;
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
              console.error("Multer error:", err);
              return res.status(500).send(err.message);
          }
  
          console.log(req.body, "this is req.body");
          const id = req.body.id;
  
          if (!req.file) {
              console.error("No file uploaded.");
              return res.status(400).send("No file uploaded.");
          }
  
          if (this.currentJobInProgress) {
              console.log("A transcoding job is already in progress. Adding to queue.");
              // Queue the parsed data
              this.queuedRequests.push({
                  req: {
                      body: { ...req.body },
                      file: { ...req.file }, // Store file buffer in memory
                  } as any, // Simulate a request object
                  res,
                  next,
              });
              return;
          }
  
          // Process the current request
          this.processVideoUpload(req, res);
      });
  }
  
  private processVideoUpload(req: any, res: Response): void {
      this.currentJobInProgress = req.body.id;
      console.log("Processing upload for:", this.currentJobInProgress);
  
      const data = {
          file: req.file.buffer,
          originalname: req.file.originalname,
          tutorId: req.body.tutorId,
      };
  
      const call = TranscoderClient.UploadFile(data);
  
      call.on("data", (response: any) => {
          console.log("Progress:", response.progress);
  
          if(globalIO){
            console.log('ehh')
            if(req.body.lessionIndex === '0'|| req.body.lessionIndex && req.body.moduleIndex === '0' || req.body.lessonIndex){
              console.log('treggerd for module' ,req.body.lessonIndex, req.body.moduleIndex)
              globalIO.to(`upload_${req.body.tutorId}`).emit('upload_progress', {
                id:req.body.id,
                file:req.file,
                status: response.status,
                message: response.message,
                progress: response.progress,
                videoUrl: response.videoURL || '',
                lessonIndex: parseInt(req.body.lessonIndex,10),
                moduleIndex: parseInt(req.body.moduleIndex,10),
                type:req.body.type
            });
            }else{
              globalIO.to(`upload_${req.body.tutorId}`).emit('upload_progress', {
              id:req.body.id,
              file:req.file,
              status: response.status,
              message: response.message,
              progress: response.progress,
              videoUrl: response.videoURL || '',
              type:req.body.type

          });
            }

          }
          console.log(`Status: ${response.status}`);
          console.log(`Message: ${response.message}`);
          console.log(`Progress: ${response.progress}%`);
          if(response.status == 'Completed'){
            console.log(`VideoURL: ${response.videoURL}`)
          }
          
        });
  
      call.on("end", () => {
          console.log("Upload completed for:", req.body.id);
          res.send({ message: "Upload completed" });
          this.finishJob();
      });
  
      call.on("error", (err: any) => {
          console.error("Error:", err.message);
          res.status(500).send("Error during transcoding");
          this.finishJob();
      });
  }
  
  private finishJob(): void {
      this.currentJobInProgress = null;
      console.log("Job finished. Checking the queue...");
  
      const nextRequest = this.queuedRequests.shift();
      if (nextRequest) {
          console.log("Processing next queued request.");
          // Simulate a new request for queued data
          this.processVideoUpload(nextRequest.req, nextRequest.res);
      } else {
          console.log("No more queued requests.");
      }
  }

    /// Endpoint handler for image upload
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
        console.log('trig23',req.query) 
      
        CourseClient.FetchCourse(req.query, (err: ServiceError | null, result: any) => {
          if(err){
            console.error("gRPC error:", err);
            return res.status(500).send("Error from gRPC service:" + err.message);
          }
          console.log(result)
          res.status(200).json(result);
        }) 
      } 

      fetchCoursesByIds(req:Request, res:Response, next: NextFunction) {
        const ids = req.query.ids;
        // const courseIds = Array.isArray(ids) ? ids : ids.split(',');
        console.log(ids, 'pruchased courses ids')
        CourseClient.GetCourseByIds({courseIds:ids}, (err: ServiceError | null, result: any) => {
          if(err){
              console.error("gRPC error:", err);
              return res.status(500).send("Error from gRPC service:" + err.message);
          }
          console.log(result)
          res.status(StatusCode.OK).send(result);
      });
      }
 
      FetchCourseDetails(req:Request, res:Response, next: NextFunction){
        console.log('trig25'  ,req.query)
        const id = req.query.id as string; 
        const userId = req.query.userId as string;

        CourseClient.FetchCourseDetails({id}, (err:ServiceError | null,  result: any) => {
          if(err){
            console.log(err)
            return res.status(500).send("Error from grpc servcie:"+ err.message);
          }
          const courseData = result;
          console.log(JSON.stringify(courseData, null, 2))
          console.log(result, ' this is course details , 3183')

          TutorClient.FetchTutorDetails({tutorId: result.tutorId}, (err:ServiceError | null, tutorDetails: any)=> {
            if(err){
              console.log(err);
              return res.status(500).send("Error from grpc tutor service: " + err.message);
            }


            if(userId){
              console.log('have userId:' , userId);
              const data = {
                userId,
                courseId:id  
              } 
  
              UserClient.CourseStatus(data, (err:ServiceError | null, result: any) => {
                console.log(result, 'course status')
                res.status(StatusCode.OK).json({courseData,courseStatus:result,tutorData:tutorDetails.tutorData});
              })
            }else{
              console.log('dont have userId ')
              const courseStatus = {
                inCart:false,
                inPurchase:false,
                inWishList:false
              }
              console.log(courseStatus);
              
              res.status(StatusCode.OK).json({courseData,courseStatus,tutorData:tutorDetails.tutorData});
            }
            
          })


          
        })
      }

      test(_req:Request, res:Response, _next:NextFunction){
        CourseClient.Test(null,(err:ServiceError | null, result:any)=> {
            if(err){
                res.send(err)
            }
            console.log(result.success)
            if(result.success){
                res.send("Course service connected")
                return
            }
            res.send("Course service not connected")
        })
    }
}
