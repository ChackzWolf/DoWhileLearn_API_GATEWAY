import express, {Application} from "express";
import UserController from "../controllers/controller";

const userRoute : Application = express();
userRoute.use(express.json());
const controller = new UserController();

userRoute.post("/register", controller.register);
userRoute.post('/verifyOTP', controller.verifyOtp);
userRoute.post('/resendOTP', controller.resendOtp);
userRoute.post("/login", )



export default userRoute; 