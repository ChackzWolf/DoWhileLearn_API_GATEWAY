import dotenv from "dotenv";
import { createServer } from 'http';
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
import chatRoute from "./modules/chat/routes/route";
import { setupSocket } from "./socket/socketServer";
dotenv.config();


const app: Express = express(); 
const server = createServer(app)
setupSocket(server);

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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
})); 
// error log end



const port = process.env.PORT || 5000;

app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Incoming request origin:", req.headers.origin);
  next();
});


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://dowhilelearn.tech',
      'https://dowhilelearn.tech'
    ];

    console.log("CORS checking origin::", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      console.log("CORS blocked origin::", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization', 
    'Content-Type',
    'Access-Control-Allow-Headers',
    'Origin',
    'Accept',
    'X-Requested-With',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Set-Cookie'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoute);
app.use("/tutor",tutorRoute);
app.use("/admin",adminRoute)
app.use("/course",courseRoute);
app.use("/auth",authRoute)
app.use("/order",orderRoute)
app.use('/chat', chatRoute);

// startKafka().catch(console.error);
server.listen(port, () => {
  console.log(`API_GATEWAY is running on ${port}`);
});