import express, { Application } from "express";
import UserController from "../controllers/controller";
import cors from 'cors';

const app = express();
const userRoute: Application = express();

app.use(cors({
    origin: 'http://localhost:5173',  // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());  // Allow preflight requests

app.use(express.json());

const controller = new UserController();

userRoute.post("/register", controller.register);
userRoute.post('/verifyOTP', controller.verifyOtp);
userRoute.post('/resendOTP', controller.resendOtp);
userRoute.post("/login", controller.userLogin);
userRoute.post("/addToCart", controller.addToCart);
userRoute.post("/makePayment", controller.makePayment);



export default userRoute;
