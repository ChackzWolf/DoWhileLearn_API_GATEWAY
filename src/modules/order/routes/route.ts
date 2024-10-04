import express, {Application} from "express";
import OrderController from "../controllers/controller";


const orderRoute : Application = express(); 
orderRoute.use(express.json());
const controller = new OrderController();  


orderRoute.get("/paymentSuccess", controller.handlePaymentSuccess);

 


export default orderRoute;   