import express, { Application } from "express";
import UserController from "../controllers/controller";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
const app = express();
const userRoute: Application = express();


app.use(express.json());

const controller = new UserController();
const middlware = new isAuthenticated();
app.use(cookieParser());

userRoute.get("/test", (req,res)=>{res.send("User route working docker push 1")});
userRoute.post("/register", controller.register);
userRoute.post('/verifyOTP', controller.verifyOtp);  
userRoute.post('/resendOTP', controller.resendOtp);
userRoute.post("/login", controller.userLogin);
userRoute.post("/addToCart",middlware.checkUserBlocked, controller.addToCart);
userRoute.post("/makePayment",middlware.checkUserBlocked, controller.makePayment);
userRoute.post("/sendOtpToEmail", controller.sendOtpToEmail)
userRoute.post("/resendOtpToEmail", controller.resendPasswordOTP)
userRoute.post("/resetPasswordOTP",controller.resetPasswordOTP)
userRoute.post("/updatePassword",controller.resetPassword)
userRoute.post('/addUserReview', controller.addReview);
userRoute.post('/updateUserDetails', controller.updateUserDetails)
userRoute.post('/googleAuth', controller.userGoogleAuth)


userRoute.get('/fetchReviewsOfCourse', controller.fetchReviewsOfCourse);
userRoute.get("/getCartItems",middlware.checkUserBlocked, controller.getCartItems)
userRoute.get("/fetchCourseDetails" , controller.fetchCourseDetails)
userRoute.get("/fetchPurchasedCourses", middlware.checkUserBlocked, controller.fetchPurchasedCourses)
userRoute.get("/fetchUserData" , controller.fetchUserDetails);



export default userRoute; 
 