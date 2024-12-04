import { Request, Response, NextFunction } from "express";
import { OrderClient } from "../../../config/grpc-client/orderClient";
import { ServiceError } from "@grpc/grpc-js";
import { PaymentClient } from "../../../config/grpc-client/paymentClient";
import { UserClient } from "../../../config/grpc-client/userClient";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { StatusCode } from "../../../interface/enums";
import { TranscoderClient } from "../../../config/grpc-client/TranscoderClient";
import path from "path";
import multer from "multer";

const videoStorage = multer.memoryStorage(); // Store file in memory for video
const uploadVideo = multer({ storage: videoStorage }).single('file'); // 'videoBinary' is the field name for video

export default class TranscoderController {  

    constructor() {
        this.UploadVideo = this.UploadVideo.bind(this);
    }

    public UploadVideo(req: Request, res: Response, next: NextFunction): void {
        console.log('reached the transcoder here.', req.body)
        const {tutorId} = req.body;
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
                file: req.file.buffer,
                tutorId
            };
 
            TranscoderClient.UploadFile(data, (err: ServiceError | null, result: any) => {
                if (err) {
                    console.error('gRPC error:', err);
                    res.status(500).send(err.message);
                } else {
                    console.log(result, ' result from transcoder service.');
                    res.status(200).json(result);
                }
            });
        });
    }
}
