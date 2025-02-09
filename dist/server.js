"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const route_1 = __importDefault(require("./modules/user/routes/route"));
const route_2 = __importDefault(require("./modules/tutor/routes/route"));
const route_3 = __importDefault(require("./modules/admin/routes/route"));
const route_4 = __importDefault(require("./modules/course/routes/route"));
const route_5 = __importDefault(require("./modules/auth/routes/route"));
const route_6 = __importDefault(require("./modules/order/routes/route"));
const route_7 = __importDefault(require("./modules/chat/routes/route"));
const socketServer_1 = require("./socket/socketServer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
(0, socketServer_1.setupSocket)(server);
// error log
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(), // Log to the console
        new winston_daily_rotate_file_1.default({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '7d' // Keep logs for 14 days
        })
    ],
});
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));
// error log end
const port = process.env.PORT || 5000;
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all HTTP methods you need
    allowedHeaders: ['Authorization', 'Content-Type'], // Include any headers your frontend sends
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/", route_1.default);
app.use("/tutor", route_2.default);
app.use("/admin", route_3.default);
app.use("/course", route_4.default);
app.use("/auth", route_5.default);
app.use("/order", route_6.default);
app.use('/chat', route_7.default);
// startKafka().catch(console.error);
server.listen(port, () => {
    console.log(`API_GATEWAY is running on ${port}`);
});
//# sourceMappingURL=server.js.map