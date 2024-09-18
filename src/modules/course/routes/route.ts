import express, {Application} from "express";
import CourseController from "../controllers/controller"
import AuthController from "../../auth/controllers/controller"

const courseRoute : Application = express();
courseRoute.use(express.json());

const authController = new AuthController()
const isAuth = authController.isAuthenticated
const controller = new CourseController();

courseRoute.post("/upload", controller.UploadVideo);
courseRoute.post("/imageUpload", controller.UploadImage);
courseRoute.post("/submitCourse", controller.SubmitCourse);


courseRoute.get("/fetchCourse" ,controller.FetchCourse);
courseRoute.get("/fetchCourseDetails", controller.FetchCourseDetails)

export default courseRoute;