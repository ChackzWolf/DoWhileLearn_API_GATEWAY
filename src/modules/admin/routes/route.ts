import express, {Application} from "express";
import AdminController from "../controllers/controller";


const adminRoute : Application = express();
adminRoute.use(express.json());
const controller = new AdminController();

adminRoute.post('/verifyOTP', controller.verifyOtp);
adminRoute.post('/resendOTP', controller.resendOtp);
adminRoute.post("/login", controller.Login );    
adminRoute.post("/fetchStudentData", controller.FetchStudentData)
 



export default adminRoute;   