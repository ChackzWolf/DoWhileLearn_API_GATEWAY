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
import orderRoute from "./modules/order/routes/route";
import { producer, consumer } from './config/kafka.config/kafka';

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



//Kafka config start
// const startKafka = async () => {
//   // Connect the producer
//   await producer.connect();
//   console.log('Kafka Producer connected');


//   await consumer.connect();
//   console.log('Kafka Consumer connected');


//   await consumer.subscribe({ topic: 'Payment', fromBeginning: true });

//   // Start consuming messages
//   consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       if (message.value) { 
//         console.log(`Received message: ${message.value.toString()}`);
//         // Process your message here
//       } else {
//         console.warn('Received a message with null value');
//       }
//     },
//   });
// };
//Kafka config end




const port = process.env.PORT || 3000;

app.use(cookieParser());


app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow credentials (cookies)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoute);
app.use("/tutor",tutorRoute);
app.use("/admin",adminRoute)
app.use("/course",courseRoute);
app.use("/auth",authRoute)
app.use("/order",orderRoute)


// startKafka().catch(console.error);
app.listen(port, () => { 
  console.log(`API_GATEWAY is running on ${port}`);
}); 
  