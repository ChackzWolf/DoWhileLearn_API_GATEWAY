import dotenv from "dotenv";
import express, { Express , Request, Response, NextFunction } from "express";
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
import orderRoute from "./modules/order/routes/route";
import chatRoutes from './Routes/chat';
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
      maxFiles: '7d' // Keep logs for 14 days
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
  origin: 'your-frontend-domain',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow credentials (cookies)
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoute);
app.use("/tutor",tutorRoute);
app.use("/admin",adminRoute)
app.use("/course",courseRoute);
app.use("/auth",authRoute)
app.use("/order",orderRoute)
app.use('/chat', chatRoutes);

// startKafka().catch(console.error);
app.listen(port, () => { 
  console.log(`API_GATEWAY is running on ${port}`);
}); 
  