"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminClient_1 = require("../../../config/grpc-client/adminClient");
const enums_1 = require("../../../interface/enums");
const tokenActivation_1 = __importDefault(require("../../../utils/tokenActivation"));
const userClient_1 = require("../../../config/grpc-client/userClient");
const tutorClient_1 = require("../../../config/grpc-client/tutorClient");
const orderClient_1 = require("../../../config/grpc-client/orderClient");
class AdminController {
    verifyOtp(req, res, next) {
        adminClient_1.AdminClient.VerifyOTP(req.body, (err, result) => {
            console.log(result, 'result');
            const { success, message, tutorData } = result;
            if (err) {
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message); // Return early if there's an error
            }
            if (success) {
                const { refreshToken, accessToken } = (0, tokenActivation_1.default)(tutorData, "TUTOR");
                res.status(200).json({ success: true, message: "OTP verified successfully.", refreshToken, accessToken });
            }
            else {
                res.status(400).json({ success: false, message: "Invalid OTP response." });
            }
        });
    }
    resendOtp(req, res, next) {
        adminClient_1.AdminClient.ResendOTP(req.body, (err, result) => {
            console.log('triggered resend api');
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    Login(req, res, next) {
        adminClient_1.AdminClient.Login(req.body, (err, result) => {
            console.log(result, 'result ');
            if (err) {
                res.status(500).send(err.message);
            }
            else {
                const { message, success, adminData, refreshToken, accessToken } = result;
                if (success) {
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict'
                    });
                    res.status(enums_1.StatusCode.Created).send({ message, success, accessToken, refreshToken, _id: adminData._id });
                }
            }
        });
    }
    ToggleBlockStudent(req, res, nest) {
        userClient_1.UserClient.ToggleBlock(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(enums_1.StatusCode.Accepted).send(result);
        });
    }
    ToggleBlockTutor(req, res, nest) {
        tutorClient_1.TutorClient.ToggleBlock(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(enums_1.StatusCode.Accepted).send(result);
        });
    }
    FetchStudentData(req, res, next) {
        console.log('triggerd fetsh students');
        userClient_1.UserClient.FetchStudentData(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(enums_1.StatusCode.Created).send(result);
        });
    }
    fetchAllOrders(req, res, next) {
        console.log('trigered fertch aall orders admin');
        orderClient_1.OrderClient.FetchAllOrders({}, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(enums_1.StatusCode.Accepted).send(result);
        });
    }
    FetchTutorData(req, res, next) {
        console.log('trig fetch tutor');
        tutorClient_1.TutorClient.FetchTutorData(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(enums_1.StatusCode.Accepted).send(result);
        });
    }
    sendOtpToEmail(req, res, next) {
        adminClient_1.AdminClient.SendOtpToEmail(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resetPasswordOTP(req, res, next) {
        console.log('trig');
        adminClient_1.AdminClient.VerifyOTPResetPassword(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resetPassword(req, res, next) {
        console.log(req.body, 'trig');
        adminClient_1.AdminClient.ResetPassword(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resendPasswordOTP(req, res, next) {
        console.log(req.body, 'trig from resend otp');
        adminClient_1.AdminClient.ResendOtpToEmail(req.body, (err, result) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
}
exports.default = AdminController;
//# sourceMappingURL=controller.js.map