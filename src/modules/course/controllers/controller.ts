import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import { ServiceError } from "@grpc/grpc-js";

// Configure multer for file handling
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

export default class CourseController {
    // Middleware to handle file upload
    private uploadMiddleware = upload.single('videoBinary');

    // Constructor to bind methods
    constructor() {
        // Binding the method to the class instance
        this.UploadVideo = this.UploadVideo.bind(this);
    }

    // Endpoint handler
    public UploadVideo(req: Request, res: Response, next: NextFunction): void {
        this.uploadMiddleware(req, res, (err: any) => {
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
                console.log('Triggered API course');
                console.log(result);
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
}
