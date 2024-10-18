import express, {Application} from "express";
import AdminController from "../controllers/controller";


const adminRoute : Application = express();
adminRoute.use(express.json());
const controller = new AdminController();

adminRoute.post('/verifyOTP', controller.verifyOtp);
adminRoute.post('/resendOTP', controller.resendOtp);
adminRoute.post("/login", controller.Login );
adminRoute.post("/toggleBlockStudent", controller.ToggleBlockStudent);  
adminRoute.post("/toggleBlockTutor", controller.ToggleBlockTutor); 
adminRoute.post("/sendOtpToEmail", controller.sendOtpToEmail)
adminRoute.post("/resetPasswordOTP",controller.resetPasswordOTP)
adminRoute.post("/updatePassword",controller.resetPassword)


adminRoute.get("/fetchStudentData", controller.FetchStudentData);
adminRoute.get("/fetchTutorData", controller.FetchTutorData);


 

export default adminRoute;   