"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("../controllers/controller"));
const isAuthenticated_1 = require("../../../middlewares/isAuthenticated");
const tutorRoute = (0, express_1.default)();
tutorRoute.use(express_1.default.json());
const controller = new controller_1.default();
const middleware = new isAuthenticated_1.isAuthenticated();
tutorRoute.post("/register", controller.register);
tutorRoute.post('/verifyOTP', controller.verifyOtp);
tutorRoute.post('/resendOTP', controller.resendOtp);
tutorRoute.post("/login", controller.tutorLogin);
tutorRoute.post("/sendOtpToEmail", controller.sendOtpToEmail);
tutorRoute.post("/resetPasswordOTP", controller.resetPasswordOTP);
tutorRoute.post("/updatePassword", controller.resetPassword);
tutorRoute.post("/uploadImage", controller.UploadImage);
tutorRoute.post("/uploadPDF", controller.UploadPDF);
tutorRoute.post("/registerDetails", controller.registerDetails);
tutorRoute.post("/resendOtpToEmail", controller.resendPasswordOTP);
tutorRoute.post("/updateTutorDetails", controller.updateTutorDetails);
tutorRoute.post("/googleAuth", controller.tutorGoogleAuth);
tutorRoute.get("/fetchTutorDetails", controller.fetchTutorDetails);
tutorRoute.get("/fetchTutorCourse", middleware.checkTutorBlocked, controller.fetchTutorCourse);
tutorRoute.get("/fetchOrdersOfTutor", middleware.checkTutorBlocked, controller.fetchOrdersOfTutor);
tutorRoute.get("/FetchStudents", middleware.checkTutorBlocked, controller.fetchStudents);
exports.default = tutorRoute;
//# sourceMappingURL=route.js.map