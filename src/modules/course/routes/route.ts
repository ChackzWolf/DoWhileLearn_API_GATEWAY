import express, {Application} from "express";
import CourseController from "../controllers/controller"
import AuthController from "../../auth/controllers/controller"
import multer, { Multer } from "multer";

const courseRoute : Application = express();
courseRoute.use(express.json());

const videoStorage = multer.memoryStorage(); // Store file in memory for video
const uploadVideo = multer({ storage: videoStorage }).single('videoBinary'); // '

const authController = new AuthController()
const isAuth = authController.isAuthenticated
const controller = new CourseController(); 
 
courseRoute.post("/upload", controller.UploadVideo);
courseRoute.post("/imageUpload", controller.UploadImage);
courseRoute.post("/submitCourse", controller.SubmitCourse);
courseRoute.post("/editCourse", controller.EditCourseDetails)

courseRoute.get("/fetchCourse" ,controller.FetchCourse);
courseRoute.get("/fetchCourseDetails", controller.FetchCourseDetails)
courseRoute.get("/fetchCoursesByIds", controller.fetchCoursesByIds)

export default courseRoute;