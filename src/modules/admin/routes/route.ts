import express, {Application} from "express";
import AdminController from "../controllers/controller";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import TutorController from "../../../modules/tutor/controllers/controller";


const adminRoute : Application = express();
adminRoute.use(express.json());
const controller = new AdminController();
const tutorController = new TutorController()
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
adminRoute.get("/fetchTutorDetails",checkAuth.checkAdminAuth, tutorController.fetchTutorDetails)
adminRoute.get("/fetchUserDetails",checkAuth.checkAdminAuth, tutorController.fetchUserDetails)

export default adminRoute;   