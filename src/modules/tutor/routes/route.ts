import express, {Application} from "express";
import TutorController from "../controllers/controller";
import { isAuthenticated } from "../../../middlewares/isAuthMiddleware";


const tutorRoute : Application = express();
tutorRoute.use(express.json());
const controller = new TutorController();
const middleware = new isAuthenticated()

tutorRoute.post("/register", controller.register);
tutorRoute.post('/verifyOTP', controller.verifyOtp);
tutorRoute.post('/resendOTP', controller.resendOtp);
tutorRoute.post("/login", controller.tutorLogin );    


tutorRoute.get("/fetchTutroCourse",middleware.checkTutorBlocked,controller.FetchTutorCourse)




export default tutorRoute;  