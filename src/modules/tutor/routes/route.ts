import express, {Application} from "express";
import TutorController from "../controllers/controller";


const tutorRoute : Application = express();
tutorRoute.use(express.json());
const controller = new TutorController();

tutorRoute.post("/register", controller.register);
tutorRoute.post('/verifyOTP', controller.verifyOtp);
tutorRoute.post('/resendOTP', controller.resendOtp);
tutorRoute.post("/login", controller.tutorLogin );    




export default tutorRoute;  