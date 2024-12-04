import express, {Application} from "express";
import TranscoderController from "../controllers/controller";


const orderRoute : Application = express(); 
orderRoute.use(express.json());
const controller = new TranscoderController();  


orderRoute.get("/TranscodeVideo", controller.UploadVideo);

export default orderRoute;   