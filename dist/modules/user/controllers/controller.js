"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userClient_1 = require("../../../config/grpc-client/userClient");
const enums_1 = require("../../../interface/enums");
const paymentClient_1 = require("../../../config/grpc-client/paymentClient");
const courseClient_1 = require("../../../config/grpc-client/courseClient");
const tutorClient_1 = require("../../../config/grpc-client/tutorClient");
class UserController {
    register(req, res, next) {
        userClient_1.UserClient.Register(req.body, (err, result) => {
            console.log('triggered api');
            console.log(result);
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    verifyOtp(req, res, next) {
        userClient_1.UserClient.VerifyOTP(req.body, (err, result) => {
            const { message, success, accessToken, refreshToken, userId } = result;
            if (err) {
                console.error("Error verifying OTP:", err);
                return res.status(500).send(err.message); // Return early if there's an error
            }
            if (success) {
                res.status(200).json({ success: true, message: "OTP verified successfully.", accessToken, refreshToken, userId });
            }
            else {
                res.status(400).json({ success: false, message });
            }
        });
    }
    resendOtp(req, res, next) {
        userClient_1.UserClient.ResendOTP(req.body, (err, result) => {
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
    userGoogleAuth(req, res, next) {
        try {
            console.log(req.body, 'google auth service request');
            userClient_1.UserClient.GoogleAuthentication(req.body, (err, result) => {
                if (err) {
                    console.error("Google auth error");
                    return res.status(500).send({ success: false, message: "Internal server error" });
                }
                if (result && result.success) {
                    console.log(result, 'result form user');
                    const { message, success, accessToken, refreshToken, userId, userData } = result;
                    console.log(result);
                    if (success && refreshToken && accessToken) {
                        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
                        return res.status(201).json({ message, success, userId, accessToken, refreshToken, userData });
                    }
                    else {
                        return res.status(201).json({ success: false, message: result.message });
                    }
                }
                else {
                    if (result.message === 'isBlocked') {
                        return res.status(403).json({ message: 'user blocked' });
                    }
                    return res.status(enums_1.StatusCode.NotAcceptable).json({ success: false, message: result.message });
                }
            });
        }
        catch (error) {
        }
    }
    userLogin(req, res, next) {
        console.log('trig user login');
        userClient_1.UserClient.UserLogin(req.body, (err, result) => {
            if (err) {
                console.error("Login error:", err.message);
                return res.status(500).send({ success: false, message: "Internal server error" });
            }
            console.log(result, 'result form user');
            if (result && result.success) {
                const { message, success, accessToken, refreshToken, userId, userData } = result;
                console.log(result);
                if (success && refreshToken && accessToken) {
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
                    return res.status(201).json({ message, success, userId, accessToken, refreshToken, userData });
                }
                else {
                    return res.status(201).json({ success: false, message: result.message });
                }
            }
            else {
                // Handle failed login cases
                if (result.message === 'isBlocked') {
                    return res.status(403).json({ message: 'user blocked' });
                }
                return res.status(enums_1.StatusCode.NotAcceptable).json({ success: false, message: result.message });
            }
        });
    }
    addToCart(req, res, next) {
        userClient_1.UserClient.AddToCart(req.body, (err, result) => {
            console.log(result, 'result');
            const { success, message, inCart } = result;
            if (success)
                (res.status(enums_1.StatusCode.Created).send({ message, success, inCart }));
        });
    }
    makePayment(req, res, next) {
        paymentClient_1.PaymentClient.PurchasePayment(req.body, (err, result) => {
            console.log(result, 'result');
            if (result) {
                res.status(enums_1.StatusCode.Created).send({ session_id: result.session_id });
            }
        });
    }
    getCartItems(req, res, next) {
        console.log('trug');
        const userId = req.query.userId;
        userClient_1.UserClient.GetCartItemsIds({ userId }, (err, GetIdsResult) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).send("Error from gRPC service:" + err.message);
            }
            console.log(GetIdsResult, 'thsi is ersult for m  Getcartitems');
            const { success, courseIds } = GetIdsResult;
            if (success) {
                courseClient_1.CourseClient.GetCourseByIds({ courseIds }, (err, result) => {
                    if (err) {
                        console.error("gRPC error:", err);
                        return res.status(500).send("Error from gRPC service:" + err.message);
                    }
                    console.log(result);
                    res.status(enums_1.StatusCode.OK).send(result);
                });
            }
            else {
                return { success: false };
            }
        });
    }
    clearCookie(req, res, next) {
        console.log('trig clearCookie');
        // res.cookie('refreshToken', '', { maxAge: 0, path: '/', httpOnly: true, secure: true });
        res.clearCookie('refreshToken', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        console.log(req.cookies.refreshToken, 'removed cookie');
        res.status(200).send({ message: 'Logged out', success: true });
    }
    fetchUserDetails(req, res, next) {
        try {
            console.log(req.params, 'req.parama');
            const { userId } = req.query;
            userClient_1.UserClient.GetUserDetails({ userId: userId }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error from grpc servcie:" + err.message);
                }
                console.log(result, 'result from fetching');
                res.status(enums_1.StatusCode.OK).json({ result });
            });
        }
        catch (error) {
        }
    }
    updateUserDetails(req, res, next) {
        try {
            const formData = req.body;
            console.log(formData, ' this is form data for user details update');
            userClient_1.UserClient.UpdateUserDetails({ formData }, (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(result);
                res.status(enums_1.StatusCode.OK).json(result);
            });
        }
        catch (error) {
        }
    }
    fetchCourseDetails(req, res, next) {
        console.log('trig 22');
        const id = req.query.id;
        const userId = req.query.userId;
        console.log(userId, '///////////////////////////////');
        courseClient_1.CourseClient.FetchCourseDetails({ id }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error from grpc servcie:" + err.message);
            }
            const courseData = result;
            console.log('Raw course data:', JSON.stringify(courseData, null, 2));
            console.log('Raw course data structure:', Object.keys(courseData));
            console.log(result);
            tutorClient_1.TutorClient.FetchTutorDetails({ tutorId: result.tutorId }, (err, tutorDetails) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error from grpc tutor service: " + err.message);
                }
                if (userId) {
                    console.log('have userId:', userId);
                    const data = {
                        userId,
                        courseId: id
                    };
                    userClient_1.UserClient.CourseStatus(data, (err, result) => {
                        console.log(result, 'course status');
                        res.status(enums_1.StatusCode.OK).json({ courseData, courseStatus: result, tutorData: tutorDetails.tutorData });
                    });
                }
                else {
                    console.log('dont have userId ');
                    const courseStatus = {
                        inCart: false,
                        inPurchase: false,
                        inWishList: false
                    };
                    console.log(courseStatus);
                    res.status(enums_1.StatusCode.OK).json({ courseData, courseStatus, tutorData: tutorDetails.tutorData });
                }
            });
            //   if(userId){
            //     console.log('have user id:', userId);
            //     const data = {
            //       userId,
            //       courseId:id
            //     }
            //     UserClient.CourseStatus(data, (err:ServiceError | null, result: any) => { 
            //       console.log(result, 'course status')
            //       res.status(StatusCode.OK).json({courseData,courseStatus:result});
            //     })
            //   }else{
            //     console.log('dont have userId: ' , userId);
            //     res.status(StatusCode.OK).json({courseData,inCart:false});
            //   }
        });
    }
    sendOtpToEmail(req, res, next) {
        userClient_1.UserClient.SendOtpToEmail(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resendPasswordOTP(req, res, next) {
        console.log(req.body, 'trig from resend otp');
        userClient_1.UserClient.ResendOtpToEmail(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resetPasswordOTP(req, res, next) {
        console.log('trig');
        userClient_1.UserClient.VerifyOTPResetPassword(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    resetPassword(req, res, next) {
        console.log(req.body, 'trig');
        userClient_1.UserClient.ResetPassword(req.body, (err, result) => {
            console.log(result);
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    addReview(req, res, next) {
        console.log('triggered add review', req.body);
        courseClient_1.CourseClient.AddReview(req.body, (err, result) => {
            console.log(result, 'result from adding review');
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
    fetchReviewsOfCourse(req, res, next) {
        console.log('triggered add review.', req.query.courseId);
        const courseId = req.query.courseId;
        courseClient_1.CourseClient.FetchReviewsOfCourse({ courseId }, (err, result) => {
            console.log(result);
            if (result) {
                console.log('sending to user');
                userClient_1.UserClient.AttachNameToReview(result, (err, finalResult) => {
                    console.log(finalResult, 'result by fetching  user name ');
                    res.status(enums_1.StatusCode.OK).json(finalResult);
                });
            }
        });
    }
    fetchPurchasedCourses(req, res, next) {
        console.log('triggered fetch purchased course');
        const userId = req.query.userId;
        courseClient_1.CourseClient.FetchPurchasedCourses({ userId }, (err, result) => {
            console.log(result, 'fetched purchased course');
            res.status(enums_1.StatusCode.OK).json(result);
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=controller.js.map