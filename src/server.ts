import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import userRoute from "./modules/user/route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both origins
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use("/", userRoute);


app.listen(port, () => { 
  console.log(`Server is running on ${port}`);
});
