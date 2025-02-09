"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const courseClient_1 = require("../../../config/grpc-client/courseClient");
const enums_1 = require("../../../interface/enums");
const userClient_1 = require("../../../config/grpc-client/userClient");
const tutorClient_1 = require("../../../config/grpc-client/tutorClient");
const chatClient_1 = require("../../../config/grpc-client/chatClient");
const TranscoderClient_1 = require("../../../config/grpc-client/TranscoderClient");
const socketServer_1 = require("../../../socket/socketServer");
// Configure multer for file handling
const videoStorage = multer_1.default.memoryStorage(); // Store file in memory for video
const imageStorage = multer_1.default.memoryStorage(); // Store file in memory for image
const uploadVideo = (0, multer_1.default)({ storage: videoStorage }).single('videoBinary'); // 'videoBinary' is the field name for video
const uploadImage = (0, multer_1.default)({ storage: imageStorage }).single('image'); // 'image' is the field name for image
class CourseController {
    // Constructor to bind methods
    constructor() {
        this.queuedRequests = [];
        this.currentJobInProgress = null;
        // Binding the method to the class instance
        this.UploadVideo = this.UploadVideo.bind(this);
        this.UploadImage = this.UploadImage.bind(this);
    }
    // Endpoint handler for video upload
    UploadVideo(req, res, next) {
        uploadVideo(req, res, (err) => {
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
                        body: Object.assign({}, req.body),
                        file: Object.assign({}, req.file), // Store file buffer in memory
                    }, // Simulate a request object
                    res,
                    next,
                });
                return;
            }
            // Process the current request
            this.processVideoUpload(req, res);
        });
    }
    processVideoUpload(req, res) {
        this.currentJobInProgress = req.body.id;
        console.log("Processing upload for:", this.currentJobInProgress);
        const data = {
            file: req.file.buffer,
            originalname: req.file.originalname,
            tutorId: req.body.tutorId,
        };
        const call = TranscoderClient_1.TranscoderClient.UploadFile(data);
        call.on("data", (response) => {
            console.log("Progress:", response.progress);
            if (socketServer_1.globalIO) {
                console.log('ehh');
                if (req.body.lessionIndex === '0' || req.body.lessionIndex && req.body.moduleIndex === '0' || req.body.lessonIndex) {
                    console.log('treggerd for module', req.body.lessonIndex, req.body.moduleIndex);
                    socketServer_1.globalIO.to(`upload_${req.body.tutorId}`).emit('upload_progress', {
                        id: req.body.id,
                        file: req.file,
                        status: response.status,
                        message: response.message,
                        progress: response.progress,
                        videoUrl: response.videoURL || '',
                        lessonIndex: parseInt(req.body.lessonIndex, 10),
                        moduleIndex: parseInt(req.body.moduleIndex, 10),
                        type: req.body.type
                    });
                }
                else {
                    socketServer_1.globalIO.to(`upload_${req.body.tutorId}`).emit('upload_progress', {
                        id: req.body.id,
                        file: req.file,
                        status: response.status,
                        message: response.message,
                        progress: response.progress,
                        videoUrl: response.videoURL || '',
                        type: req.body.type
                    });
                }
            }
            console.log(`Status: ${response.status}`);
            console.log(`Message: ${response.message}`);
            console.log(`Progress: ${response.progress}%`);
            if (response.status == 'Completed') {
                console.log(`VideoURL: ${response.videoURL}`);
            }
        });
        call.on("end", () => {
            console.log("Upload completed for:", req.body.id);
            res.send({ message: "Upload completed" });
            this.finishJob();
        });
        call.on("error", (err) => {
            console.error("Error:", err.message);
            res.status(500).send("Error during transcoding");
            this.finishJob();
        });
    }
    finishJob() {
        this.currentJobInProgress = null;
        console.log("Job finished. Checking the queue...");
        const nextRequest = this.queuedRequests.shift();
        if (nextRequest) {
            console.log("Processing next queued request.");
            // Simulate a new request for queued data
            this.processVideoUpload(nextRequest.req, nextRequest.res);
        }
        else {
            console.log("No more queued requests.");
        }
    }
    /// Endpoint handler for image upload
    UploadImage(req, res, next) {
        uploadImage(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
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
            console.log(data, 'datajj');
            // Call gRPC service
            courseClient_1.CourseClient.UploadImage(data, (err, result) => {
                if (err) {
                    console.error('gRPC error:', err);
                    return res.status(500).send('Error from gRPC service: ' + err.message);
                }
                // Retrieve and validate the public URL from gRPC response
                const { s3Url, success, message } = result;
                console.log(result);
                console.log(s3Url, success, message);
                if (!success) {
                    return res.status(500).send('Failed to get image URL from gRPC service');
                }
                // Send the public URL back in the response
                res.status(200).json({ s3Url, success, message });
            });
        }));
    }
    ;
    // Uploading a new course
    SubmitCourse(req, res, next) {
        console.log('trig');
        const data = req.body;
        const { tutorId } = req.body;
        console.log(data, ' data,,,');
        courseClient_1.CourseClient.SubmitCourse(req.body, (err, result) => {
            console.log(JSON.stringify(req.body, null, 2));
            if (err) {
                console.error('gRPC error:', err);
                return res.status(500).send('Error from gRPC service: ' + err.message);
            }
            console.log(result);
            if (result.success) {
                const { courseId, courseTitle, thumbnail } = result;
                const data = {
                    tutorId,
                    courseId
                };
                console.log('heading to tutorClient', data);
                tutorClient_1.TutorClient.AddCourseToTutor(data, (err, tutorResult) => {
                    if (err) { // Rollbacking if error
                        console.error('gRPC error from tutor:', err);
                        courseClient_1.CourseClient.DeleteCourse(data, (err, DeleteCourseResult) => {
                            const response = {
                                success: false,
                                message: 'Course create failed'
                            };
                            res.status(200).json(response);
                        });
                    }
                    if (!tutorResult.success) { // Rollbacking if not success 
                        console.log('tutor update was not success');
                        const data = {
                            courseId
                        };
                        courseClient_1.CourseClient.DeleteCourse(data, (err, DeleteCourseResult) => {
                            const response = {
                                success: false,
                                message: 'Course create failed'
                            };
                            res.status(200).json(response);
                        });
                    }
                    console.log(courseId, 'courseId');
                    chatClient_1.ChatClient.CreateChatRoom({ courseId, courseName: courseTitle, thumbnail, tutorId }, (err, ChatRoomResult) => {
                        console.log(ChatRoomResult, 'created chatroom');
                    });
                    res.status(200).json(result);
                });
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    EditCourseDetails(req, res, next) {
        console.log('trig', req.body);
        console.log(JSON.stringify(req.body, null, 2));
        courseClient_1.CourseClient.EditCourse(req.body, (err, result) => {
            if (err) {
                console.error('gRPC error:', err);
                return res.status(500).send('Error from gRPC service: ' + err.message);
            }
            console.log(result);
            res.status(200).json(result);
        });
    }
    FetchCourse(req, res, next) {
        console.log('trig23', req.query);
        courseClient_1.CourseClient.FetchCourse(req.query, (err, result) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).send("Error from gRPC service:" + err.message);
            }
            console.log(result);
            res.status(200).json(result);
        });
    }
    fetchCoursesByIds(req, res, next) {
        const ids = req.query.ids;
        // const courseIds = Array.isArray(ids) ? ids : ids.split(',');
        console.log(ids, 'pruchased courses ids');
        courseClient_1.CourseClient.GetCourseByIds({ courseIds: ids }, (err, result) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).send("Error from gRPC service:" + err.message);
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).send(result);
        });
    }
    FetchCourseDetails(req, res, next) {
        console.log('trig25', req.query);
        const id = req.query.id;
        const userId = req.query.userId;
        courseClient_1.CourseClient.FetchCourseDetails({ id }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error from grpc servcie:" + err.message);
            }
            const courseData = result;
            console.log(JSON.stringify(courseData, null, 2));
            console.log(result, ' this is course details , 3183');
            tutorClient_1.TutorClient.FetchTutorDetails({ tutorId: result.tutorId }, (err, tutorDetails) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error from grpc tutor service: " + err.message);
                }
                if (userId) {
                    console.log('have userId:', userId);
                    const data = {
                        userId,
                        courseId: id
                    };
                    userClient_1.UserClient.CourseStatus(data, (err, result) => {
                        console.log(result, 'course status');
                        res.status(enums_1.StatusCode.OK).json({ courseData, courseStatus: result, tutorData: tutorDetails.tutorData });
                    });
                }
                else {
                    console.log('dont have userId ');
                    const courseStatus = {
                        inCart: false,
                        inPurchase: false,
                        inWishList: false
                    };
                    console.log(courseStatus);
                    res.status(enums_1.StatusCode.OK).json({ courseData, courseStatus, tutorData: tutorDetails.tutorData });
                }
            });
        });
    }
}
exports.default = CourseController;
//# sourceMappingURL=controller.js.map