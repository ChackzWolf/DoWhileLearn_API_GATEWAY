"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("../controllers/controller"));
const isAuthenticated_1 = require("../../../middlewares/isAuthenticated");
const controller_2 = __importDefault(require("../../../modules/tutor/controllers/controller"));
const adminRoute = (0, express_1.default)();
adminRoute.use(express_1.default.json());
const controller = new controller_1.default();
const tutorController = new controller_2.default();
const checkAuth = new isAuthenticated_1.isAuthenticated();
adminRoute.post('/verifyOTP', controller.verifyOtp);
adminRoute.post('/resendOTP', controller.resendOtp);
adminRoute.post("/login", controller.Login);
adminRoute.post("/toggleBlockStudent", controller.ToggleBlockStudent);
adminRoute.post("/toggleBlockTutor", controller.ToggleBlockTutor);
adminRoute.post("/sendOtpToEmail", controller.sendOtpToEmail);
adminRoute.post("/resendOtpToEmail", controller.resendPasswordOTP);
adminRoute.post("/resetPasswordOTP", controller.resetPasswordOTP);
adminRoute.post("/updatePassword", controller.resetPassword);
adminRoute.get("/fetchStudentData", checkAuth.checkAdminAuth, controller.FetchStudentData);
adminRoute.get("/fetchTutorData", checkAuth.checkAdminAuth, controller.FetchTutorData);
adminRoute.get("/fetchAllOrders", checkAuth.checkAdminAuth, controller.fetchAllOrders);
adminRoute.get("/fetchTutorDetails", checkAuth.checkAdminAuth, tutorController.fetchTutorDetails);
exports.default = adminRoute;
//# sourceMappingURL=route.js.map