"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("../controllers/controller"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const isAuthenticated_1 = require("../../../middlewares/isAuthenticated");
const app = (0, express_1.default)();
const authRoute = (0, express_1.default)();
authRoute.use(express_1.default.json());
const controller = new controller_1.default();
const middleware = new isAuthenticated_1.isAuthenticated();
app.use((0, cookie_parser_1.default)());
authRoute.post("/isAuth", controller.isAuthenticated);
authRoute.post('/user-refresh-token', controller.userRefreshToken);
authRoute.post('/admin-refresh-token', controller.adminRefreshToken);
authRoute.post('/tutor-refresh-token', controller.tutorRefreshToken);
authRoute.post('/clearUserCookies', controller.clearUserCookies);
exports.default = authRoute;
//# sourceMappingURL=route.js.map