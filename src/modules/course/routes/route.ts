import express, {Application} from "express";
import CourseController from "../controllers/controller"
import AuthController from "../../auth/controllers/controller"

const courseRoute : Application = express();
courseRoute.use(express.json());

const authController = new AuthController()
const isAuth = authController.isAuthenticated
const controller = new CourseController();

courseRoute.post("/upload",isAuth, controller.UploadVideo);
courseRoute.post("/imageUpload",isAuth, controller.UploadImage);
courseRoute.post("/submitCourse",isAuth, controller.SubmitCourse);
courseRoute.get("/fetchCourse", isAuth ,controller.FetchCourse);

export default courseRoute;