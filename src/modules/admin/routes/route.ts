import express, {Application} from "express";
import AdminController from "../controllers/controller";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";


const adminRoute : Application = express();
adminRoute.use(express.json());
const controller = new AdminController();
const checkAuth = new isAuthenticated()
 
adminRoute.post('/verifyOTP', controller.verifyOtp);
adminRoute.post('/resendOTP', controller.resendOtp);
adminRoute.post("/login", controller.Login );
adminRoute.post("/toggleBlockStudent", controller.ToggleBlockStudent);  
adminRoute.post("/toggleBlockTutor", controller.ToggleBlockTutor); 
adminRoute.post("/sendOtpToEmail", controller.sendOtpToEmail)
adminRoute.post("/resendOtpToEmail",controller.resendPasswordOTP)
adminRoute.post("/resetPasswordOTP",controller.resetPasswordOTP)
adminRoute.post("/updatePassword",controller.resetPassword)

adminRoute.get("/fetchStudentData",checkAuth.checkAdminAuth, controller.FetchStudentData);
adminRoute.get("/fetchTutorData",checkAuth.checkAdminAuth, controller.FetchTutorData);
adminRoute.get("/fetchAllOrders",checkAuth.checkAdminAuth, controller.fetchAllOrders)


 

export default adminRoute;   