import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import userRoute from "./modules/user/routes/route";
import tutorRoute from "./modules/tutor/routes/route";
import adminRoute from "./modules/admin/routes/route";
import courseRoute from "./modules/course/routes/route"
import authRoute from "./modules/auth/routes/route";
dotenv.config();
const app: Express = express();


// error log
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d' // Keep logs for 14 days
    })
  ],
});
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
// error log end





 


const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both origins
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoute);
app.use("/tutor",tutorRoute);
app.use("/admin",adminRoute)
app.use("/course",courseRoute);
app.use("/auth",authRoute)



app.listen(port, () => { 
  console.log(`API_GATEWAY is running on ${port}`);
});
