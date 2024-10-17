import express, {Application} from "express";
import AuthController from "../controllers/controller";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "../../../middlewares/isAuthMiddleware";
const app = express()
const authRoute : Application = express();

authRoute.use(express.json());

const controller = new AuthController(); 
const middleware = new isAuthenticated();
app.use(cookieParser());
authRoute.post("/isAuth", controller.isAuthenticated);
authRoute.post('/user-refresh-token', middleware.checkUserBlocked , controller.userRefreshToken);
authRoute.post('/admin-refresh-token', controller.adminRefreshToken);
authRoute.post('/tutor-refresh-token', controller.tutorRefreshToken);
authRoute.post('/clearUserCookies', controller.clearUserCookies)


export default authRoute; 