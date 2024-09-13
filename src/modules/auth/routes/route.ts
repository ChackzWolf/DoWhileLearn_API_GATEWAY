import express, {Application} from "express";
import AuthController from "../controllers/controller";


const authRoute : Application = express();
authRoute.use(express.json());
const controller = new AuthController();

authRoute.post("/isAuth", controller.isAuthenticated);
authRoute.post('/refresh-token', controller.refreshToken);


export default authRoute;