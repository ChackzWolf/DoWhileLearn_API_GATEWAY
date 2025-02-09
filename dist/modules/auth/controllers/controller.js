"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authClient_1 = require("../../../config/grpc-client/authClient");
class AuthController {
    isAuthenticated(req, res, _next) {
        authClient_1.AuthClient.IsAuthenticated(req.body, (err, result) => {
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
    userRefreshToken(req, res, _next) {
        console.log('refresh token hit');
        const refreshToken = req.cookies.userRefreshToken; // Extract refreshToken from cookies
        console.log(refreshToken, ':refresh token');
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Refresh token not provided." });
            return;
        }
        // Prepare the payload with the extracted refresh token
        const payload = { refreshToken };
        // Call the Auth service to refresh the token
        console.log("Calling AuthClient.RefreshToken");
        authClient_1.AuthClient.RefreshToken(payload, { deadline: Date.now() + 5000 }, (err, result) => {
            console.log('inside RefreshToken');
            if (err) {
                console.error("Error refreshing token:", err);
                return res.status(500).send(err.message);
            }
            // Add this to ensure callback is reached
            console.log("Received result from AuthClient.RefreshToken", result);
            const { success, message, accessToken, refreshToken: newRefreshToken } = result;
            if (success) {
                if (newRefreshToken) {
                    // res.cookie('accessToken', accessToken, { httpOnly: true, secure: true })    
                    // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, path: '/' });
                }
                res.status(200).json({ success: true, accessToken, message, refreshToken: newRefreshToken });
            }
            else {
                res.status(400).json({ success: false, message: "Invalid refresh token response." });
            }
        });
    }
    tutorRefreshToken(req, res, _next) {
        console.log('refresh token hit');
        const refreshToken = req.cookies.tutorRefreshToken; // Extract refreshToken from cookies
        console.log(refreshToken, ':refresh token');
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Refresh token not provided." });
            return;
        }
        // Prepare the payload with the extracted refresh token
        const payload = { refreshToken };
        // Call the Auth service to refresh the token
        console.log("Calling AuthClient.RefreshToken");
        authClient_1.AuthClient.RefreshToken(payload, { deadline: Date.now() + 5000 }, (err, result) => {
            console.log('inside RefreshToken');
            if (err) {
                console.error("Error refreshing token:", err);
                return res.status(500).send(err.message);
            }
            // Add this to ensure callback is reached
            console.log("Received result from AuthClient.RefreshToken", result);
            const { success, message, accessToken, refreshToken: newRefreshToken } = result;
            if (success) {
                if (newRefreshToken) {
                    // res.cookie('accessToken', accessToken, { httpOnly: true, secure: true })    
                    // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, path: '/' });
                }
                res.status(200).json({ success: true, accessToken, message, refreshToken: newRefreshToken });
            }
            else {
                res.status(400).json({ success: false, message: "Invalid refresh token response." });
            }
        });
    }
    adminRefreshToken(req, res, _next) {
        console.log('refresh token hit');
        const refreshToken = req.cookies.adminRefreshToken; // Extract refreshToken from cookies
        console.log(refreshToken, ':refresh token');
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Refresh token not provided." });
            return;
        }
        // Prepare the payload with the extracted refresh token
        const payload = { refreshToken };
        // Call the Auth service to refresh the token
        console.log("Calling AuthClient.RefreshToken");
        authClient_1.AuthClient.RefreshToken(payload, { deadline: Date.now() + 5000 }, (err, result) => {
            console.log('inside RefreshToken');
            if (err) {
                console.error("Error refreshing token:", err);
                return res.status(500).send(err.message);
            }
            // Add this to ensure callback is reached
            console.log("Received result from AuthClient.RefreshToken", result);
            const { success, message, accessToken, refreshToken: newRefreshToken } = result;
            if (success) {
                if (newRefreshToken) {
                    // res.cookie('accessToken', accessToken, { httpOnly: true, secure: true })    
                    // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, path: '/' });
                }
                res.status(200).json({ success: true, accessToken, message, refreshToken: newRefreshToken });
            }
            else {
                res.status(400).json({ success: false, message: "Invalid refresh token response." });
            }
        });
    }
    clearUserCookies(req, res, _next) {
        console.log('clearnign refresh token');
        res.clearCookie('refreshToken', { httpOnly: true, path: '/' }); // Clears the cookie
        res.status(200).json({ success: true });
        console.log('cleared');
    }
}
exports.default = AuthController;
//# sourceMappingURL=controller.js.map