"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("../controllers/controller"));
const controller_2 = __importDefault(require("../../auth/controllers/controller"));
const multer_1 = __importDefault(require("multer"));
const courseRoute = (0, express_1.default)();
courseRoute.use(express_1.default.json());
const videoStorage = multer_1.default.memoryStorage(); // Store file in memory for video
const uploadVideo = (0, multer_1.default)({ storage: videoStorage }).single('videoBinary'); // '
const authController = new controller_2.default();
const isAuth = authController.isAuthenticated;
const controller = new controller_1.default();
courseRoute.post("/upload", controller.UploadVideo);
courseRoute.post("/imageUpload", controller.UploadImage);
courseRoute.post("/submitCourse", controller.SubmitCourse);
courseRoute.post("/editCourse", controller.EditCourseDetails);
courseRoute.get("/fetchCourse", controller.FetchCourse);
courseRoute.get("/fetchCourseDetails", controller.FetchCourseDetails);
courseRoute.get("/fetchCoursesByIds", controller.fetchCoursesByIds);
exports.default = courseRoute;
//# sourceMappingURL=route.js.map