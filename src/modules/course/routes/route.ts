import express, {Application} from "express";
import CourseController from "../controllers/controller"


const courseRoute : Application = express();
courseRoute.use(express.json());
const controller = new CourseController();

courseRoute.post("/upload", controller.UploadVideo);

export default courseRoute;