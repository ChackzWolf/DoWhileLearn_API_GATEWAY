"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tutorClient_1 = require("../../../config/grpc-client/tutorClient");
const enums_1 = require("../../../interface/enums");
const courseClient_1 = require("../../../config/grpc-client/courseClient");
const tokenActivation_1 = __importDefault(require("../../../utils/tokenActivation"));
const orderClient_1 = require("../../../config/grpc-client/orderClient");
const multer_1 = __importDefault(require("multer"));
const userClient_1 = require("../../../config/grpc-client/userClient");
const imageStorage = multer_1.default.memoryStorage(); // Store file in memory for image
const pdfStorage = multer_1.default.memoryStorage(); // Store PDF file in memory
const uploadImage = (0, multer_1.default)({ storage: imageStorage }).single('image'); // 'image' is the field name for image
const uploadPDF = (0, multer_1.default)({ storage: pdfStorage }).single('pdf'); // 'pdf' is the field name for the PDF
class TutorController {
    constructor() {
        // Binding the method to the class instance
        this.UploadImage = this.UploadImage.bind(this);
        this.UploadPDF = this.UploadPDF.bind(this);
    }
    UploadImage(req, res, next) {
        console.log(req.body, "trig image");
        uploadImage(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
            console.log('1', req);
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).send('Error uploading file: ' + err.message);
            }
            console.log('2');
            // Check if file is uploaded
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }
            console.log('3');
            // Check if image name is provided
            if (!req.file.originalname) {
                return res.status(400).send('Image name is required');
            }
            console.log('4');
            // Prepare data for gRPC request
            const data = {
                imageBinary: req.file.buffer,
                imageName: req.file.originalname,
            };
            console.log(data, 'kkkkkkkkkkk');
            // Call gRPC service
            tutorClient_1.TutorClient.UploadImage(data, (err, result) => {
                if (err) {
                    console.error('gRPC error:', err);
                    return res.status(500).send('Error from gRPC service: ' + err.message);
                }
                // Retrieve and validate the public URL from gRPC response
                const { s3Url, success, message } = result;
                console.log(result);
                console.log(s3Url, success, message);
                if (!success) {
                    return res.status(500).send('Failed to get image URL from gRPC service');
                }
                // Send the public URL back in the response
                res.status(200).json({ s3Url, success, message });
            });
        }));
    }
    UploadPDF(req, res, next) {
        console.log(req.body, "trig data form pdf");
        uploadPDF(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
            console.log('1', req);
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).send('Error uploading file: ' + err.message);
            }
            console.log('2');
            // Check if PDF is uploaded
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }
            console.log('3');
            // Check if PDF name is provided
            if (!req.file.originalname) {
                return res.status(400).send('PDF name is required');
            }
            console.log('4');
            // Prepare data for gRPC request
            const data = {
                pdfBinary: req.file.buffer,
                pdfName: req.file.originalname,
            };
            console.log(data, 'kkkkkkkkkkk');
            // Call gRPC service for PDF upload
            tutorClient_1.TutorClient.UploadPDF(data, (err, result) => {
                if (err) {
                    console.error('gRPC error:', err);
                    return res.status(500).send('Error from gRPC service: ' + err.message);
                }
                // Retrieve and validate the public URL from gRPC response
                const { s3Url, success, message } = result;
                console.log(result);
                console.log(s3Url, success, message);
                if (!success) {
                    return res.status(500).send('Failed to get PDF URL from gRPC service');
                }
                // Send the public URL back in the response
                res.status(200).json({ s3Url, success, message });
            });
        }));
    }
    tutorGoogleAuth(req, res, next) {
        try {
            console.log(req.body, 'google auth service request');
            tutorClient_1.TutorClient.GoogleAuth(req.body, (err, result) => {
                if (err) {
                    console.error("Google auth error");
                    return res.status(500).send({ success: false, message: "Internal server error" });
                }
                if (result && result.success) {
                    console.log(result, 'result form tutor');
                    const { message, success, accessToken, refreshToken, tutorId, tutorData, type } = result;
                    console.log(result);
                    if (success && refreshToken && accessToken) {
                        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
                        return res.status(201).json({ message, success, tutorId, type, accessToken, refreshToken, tutorData });
                    }
                    else {
                        return res.status(201).json({ success: false, message: result.message });
                    }
                }
                else {
                    if (result.message === 'isBlocked') {
                        return res.status(403).json({ message: 'tutor blocked' });
                    }
                    return res.status(enums_1.StatusCode.NotAcceptable).json({ success: false, message: result.message });
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    register(req, res, next) {
        tutorClient_1.TutorClient.Register(req.body, (err, result) => {
            console.log('triggered api tutor');
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
            else {
                console.log(result);
                res.status(200).json(result);
            }
        });
    }
    verifyOtp(req, res, next) {
        tutorClient_1.TutorClient.VerifyOTP(req.body, (err, result) => {
            console.log(result, 'result');
            const { success, message, tutorData, tutorId } = result;
            if (err) {
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message); // Return early if there's an error
            }
            if (success) {
                const { refreshToken, accessToken } = (0, tokenActivation_1.default)(tutorData, "TUTOR");
                res.status(200).json({ success: true, message: "OTP verified successfully.", refreshToken, accessToken, id: tutorData._id, tutorId, tutorData });
            }
            else {
                res.status(400).json({ success: false, message: "Invalid OTP response." });
            }
        });
    }
    resendOtp(req, res, next) {
        console.log('triggered resend otp tutor');
        tutorClient_1.TutorClient.ResendOTP(req.body, (err, result) => {
            console.log('result:', result);
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    tutorLogin(req, res, next) {
        tutorClient_1.TutorClient.Login(req.body, (err, result) => {
            console.log(result, 'result ');
            const { message, success, tutorData } = result;
            if (err) {
                res.status(500).send(err.message);
            }
            else {
                if (success) {
                    console.log(tutorData, 'tutor data');
                    const { refreshToken, accessToken } = (0, tokenActivation_1.default)(tutorData, "TUTOR");
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: true, // Make sure to use 'secure' in production with HTTPS
                        sameSite: 'strict'
                    });
                    res.status(enums_1.StatusCode.Created).send({ message, success, accessToken, refreshToken, tutorId: tutorData._id, tutorData });
                }
                else {
                    // Handle failed login cases 
                    if (result.message === 'isBlocked') {
                        console.log('here');
                        return res.status(403).json({ message: 'user blocked' });
                    }
                    console.log('reached her');
                    return res.status(enums_1.StatusCode.Created).json({ success: false, message: "Login failed. Invalid credentials.", tutorData });
                }
            }
        });
    }
    fetchTutorCourse(req, res, next) {
        console.log('trig fetching course');
        const tutorId = req.query.tutorId;
        courseClient_1.CourseClient.FetchTutorCourse({ tutorId }, (err, result) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).send("Error from gRPC service:" + err.message);
            }
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    fetchStudents(req, res, next) {
        console.log('trig fetching students');
        const tutorId = req.query.tutorId;
        tutorClient_1.TutorClient.FetchTutorStudents({ tutorId }, (err, result) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).send("Error from gRPC service:" + err.message);
            }
            if (result.success && result.studentIds) {
                console.log(result);
                userClient_1.UserClient.FetchUsersByIds({ studentIds: result.studentIds }, (err, result) => {
                    if (err) {
                        console.error("gRPC error user service:", err);
                        return res.status(500).send("Error from gRPC service user service:" + err.message);
                    }
                    console.log(result, 'fetched users by Ids');
                    res.status(enums_1.StatusCode.OK).json(result);
                });
            }
        });
    }
    fetchTutorDetails(req, res, next) {
        console.log("Trig fetch course//////////////////");
        const tutorId = req.query.tutorId;
        tutorClient_1.TutorClient.FetchTutorDetails({ tutorId }, (err, result) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).send("Error from gRPC service:" + err.message);
            }
            console.log(result, 'result of fetching tutor details.');
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    sendOtpToEmail(req, res, next) {
        console.log('tutor trig', req.body);
        tutorClient_1.TutorClient.SendOtpToEmail(req.body, (err, result) => {
            console.log(result, 'of tutor send  otp result');
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resetPasswordOTP(req, res, next) {
        console.log('trig');
        tutorClient_1.TutorClient.VerifyOTPResetPassword(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resetPassword(req, res, next) {
        console.log(req.body, 'trig');
        tutorClient_1.TutorClient.ResetPassword(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    registerDetails(req, res, next) {
        console.log(req.body, 'details');
        tutorClient_1.TutorClient.RegistrationDetails(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resendPasswordOTP(req, res, next) {
        console.log(req.body, 'trig from resend otppppppppppppp');
        tutorClient_1.TutorClient.ResendOtpToEmail(req.body, (err, result) => {
            if (err) {
                console.log('error resending otp', err);
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    updateTutorDetails(req, res, next) {
        console.log(req.body, 'this is req.bvody');
        const formData = req.body;
        tutorClient_1.TutorClient.UpdateTutorDetails({ formData }, (err, result) => {
            if (err) {
                console.log(err);
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    fetchOrdersOfTutor(req, res, next) {
        const tutorId = req.query.tutorId;
        console.log('tutorId:', tutorId);
        orderClient_1.OrderClient.FetchOrderByTutorId({ tutorId }, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
}
exports.default = TutorController;
//# sourceMappingURL=controller.js.map