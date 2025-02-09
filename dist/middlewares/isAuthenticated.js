"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const userClient_1 = require("../config/grpc-client/userClient");
const tutorClient_1 = require("../config/grpc-client/tutorClient");
const authClient_1 = require("../config/grpc-client/authClient");
class isAuthenticated {
    // Middleware to check if the user is blocked
    checkUserBlocked(req, res, next) {
        const { userId, userAccessToken } = req.cookies;
        console.log(userId, 'triggered middleware.......................................');
        const data = {
            accessToken: userAccessToken,
            role: 'USER'
        };
        console.log('trigered here', data);
        authClient_1.AuthClient.IsAuthenticated(data, (err, result) => {
            console.log('triggered api tutor');
            if (err) {
                console.error(err, 'auth check faild');
                res.status(500).send(err.message);
                return;
            }
            if (!result.success) {
                console.log(result, 'this si auth result failed');
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access. Please log in again.'
                });
            }
            if (!userId) {
                return res.status(401).json({ message: 'User ID is missing' });
            }
            userClient_1.UserClient.isBlocked({ userId }, (err, result) => {
                if (err) {
                    console.error('Error in isBlocked middleware:', err);
                    return res.status(500).json({ message: err.message });
                }
                console.log(result, 'result for middleware');
                if (result && result.isBlocked) {
                    // Clear cookies
                    res.clearCookie('userId', { path: '/' });
                    res.clearCookie('userAccessToken', { path: '/' });
                    res.clearCookie('userRefreshToken', { path: '/' });
                    // Redirecting to the login page with a message
                    return res.status(403).json({ message: 'user blocked' });
                }
                // If not blocked, proceed to the next middleware or route handler
                next();
            });
        });
    }
    checkTutorBlocked(req, res, next) {
        const { tutorId, tutorAccessToken } = req.cookies;
        console.log(tutorId, 'triggered middleware.......................................');
        const data = {
            accessToken: tutorAccessToken,
            role: 'TUTOR'
        };
        console.log(data, 'datat from tutor');
        authClient_1.AuthClient.IsAuthenticated(data, (err, result) => {
            console.log('triggered api tutor', result);
            if (err) {
                console.error(err, 'auth check faild');
                res.status(500).send(err.message);
                return;
            }
            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access. Please log in again.'
                });
            }
            if (!tutorId) {
                return res.status(401).json({ message: 'User ID is missing' });
            }
            tutorClient_1.TutorClient.isBlocked({ tutorId }, (err, result) => {
                if (err) {
                    console.error('Error in isBlocked middleware:', err);
                    return res.status(500).json({ message: err.message });
                }
                console.log(result, 'result for middleware');
                if (result && result.isBlocked) {
                    // Clear cookies
                    res.clearCookie('tutorId', { path: '/' });
                    res.clearCookie('tutorAccessToken', { path: '/' });
                    res.clearCookie('tutorRefreshToken', { path: '/' });
                    // Redirecting to the login page with a message
                    return res.status(403).json({ message: 'tutor blocked' });
                }
                // If not blocked, proceed to the next middleware or route handler
                next();
            });
        });
    }
    checkAdminAuth(req, res, next) {
        const { adminAccessToken, adminRefreshToken } = req.cookies;
        const data = {
            accessToken: adminAccessToken,
            refreshToken: adminRefreshToken,
            role: 'ADMIN'
        };
        console.log('trigered here', data);
        authClient_1.AuthClient.IsAuthenticated(data, (err, result) => {
            console.log('triggered api admin');
            if (err) {
                console.error(err, 'auth check faild');
                res.status(500).send(err.message);
                return;
            }
            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access. Please log in again.'
                });
            }
            next();
        });
    }
}
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map