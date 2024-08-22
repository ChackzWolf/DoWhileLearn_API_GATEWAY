import express, {Application} from "express";
import UserController from "./controller";

const userRoute : Application = express();
userRoute.use(express.json());
const controller = new UserController();

userRoute.post("/register", controller.register);
userRoute.post('/verifyOTP', controller.verifyOtp)
userRoute.post("/login",)



export default userRoute; 