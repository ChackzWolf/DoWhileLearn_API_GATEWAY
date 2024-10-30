import express, {Application} from "express";
import TutorController from "../controllers/controller";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";


const tutorRoute : Application = express();
tutorRoute.use(express.json());
const controller = new TutorController();
const middleware = new isAuthenticated() 

tutorRoute.post("/register", controller.register);
tutorRoute.post('/verifyOTP', controller.verifyOtp); 
tutorRoute.post('/resendOTP', controller.resendOtp);
tutorRoute.post("/login", controller.tutorLogin );    
tutorRoute.post("/sendOtpToEmail", controller.sendOtpToEmail)
tutorRoute.post("/resetPasswordOTP",controller.resetPasswordOTP)
tutorRoute.post("/updatePassword",controller.resetPassword);
tutorRoute.post("/uploadImage",controller.UploadImage)
tutorRoute.post("/uploadPDF", controller.UploadPDF);
tutorRoute.post("/registerDetails", controller.registerDetails);
tutorRoute.post("/resendOtpToEmail", controller.resendPasswordOTP)
tutorRoute.get("/fetchTutroCourse",middleware.checkTutorBlocked,controller.FetchTutorCourse)




export default tutorRoute;  