import { Request, Response, NextFunction } from "express";
import { CourseClient } from "../../../config/grpc-client/courseClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError




export default class CourseController {  

    UploadVideo(req: Request, res: Response, next: NextFunction) {

        CourseClient.UploadVideo(req.body, (err: ServiceError | null, result: any) => {
            console.log('triggered api course')
            console.log(result)
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            } else {
                console.log(result) 
                res.status(200).json(result);
            }
        }); 
    }
}    