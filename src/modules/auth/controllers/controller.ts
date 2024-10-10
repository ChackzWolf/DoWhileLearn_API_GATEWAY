import { Request, Response, NextFunction } from "express";
import { AuthClient } from "../../../config/grpc-client/authClient";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError




export default class AuthController {  

    isAuthenticated(req: Request, res: Response, _next: NextFunction) {
        AuthClient.IsAuthenticated(req.body, (err: ServiceError | null, result: any) => {
            console.log('triggered api tutor')
            if (err) {
                console.error(err);
                res.status(500).send(err.message);
            } else {
                console.log(result) 
                res.status(200).json(result);
            }
        }); 
    }

    userRefreshToken(req: Request, res: Response, _next: NextFunction): void {
        console.log('refresh token hit')
        const refreshToken = req.cookies.userRefreshToken; // Extract refreshToken from cookies
        console.log(refreshToken,':refresh token')
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Refresh token not provided." });
            return;
        }
    
        // Prepare the payload with the extracted refresh token
        const payload = { refreshToken };
    
        // Call the Auth service to refresh the token
        console.log("Calling AuthClient.RefreshToken");
        AuthClient.RefreshToken(payload,{ deadline: Date.now() + 5000 }, (err: ServiceError | null, result: any) => {
            console.log('inside RefreshToken')
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
                res.status(200).json({ success: true, accessToken, message, refreshToken : newRefreshToken });
            } else {
                res.status(400).json({ success: false, message: "Invalid refresh token response." });
            }
        });
    }
    tutorRefreshToken(req: Request, res: Response, _next: NextFunction): void {
        console.log('refresh token hit')
        const refreshToken = req.cookies.tutorRefreshToken; // Extract refreshToken from cookies
        console.log(refreshToken,':refresh token')
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Refresh token not provided." });
            return;
        }
    
        // Prepare the payload with the extracted refresh token
        const payload = { refreshToken };
    
        // Call the Auth service to refresh the token
        console.log("Calling AuthClient.RefreshToken");
        AuthClient.RefreshToken(payload,{ deadline: Date.now() + 5000 }, (err: ServiceError | null, result: any) => {
            console.log('inside RefreshToken')
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
                res.status(200).json({ success: true, accessToken, message, refreshToken : newRefreshToken });
            } else {
                res.status(400).json({ success: false, message: "Invalid refresh token response." });
            }
        });
    }
    adminRefreshToken(req: Request, res: Response, _next: NextFunction): void {
        console.log('refresh token hit')
        const refreshToken = req.cookies.adminRefreshToken; // Extract refreshToken from cookies
        console.log(refreshToken,':refresh token')
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Refresh token not provided." });
            return;
        }
    
        // Prepare the payload with the extracted refresh token
        const payload = { refreshToken };
    
        // Call the Auth service to refresh the token
        console.log("Calling AuthClient.RefreshToken");
        AuthClient.RefreshToken(payload,{ deadline: Date.now() + 5000 }, (err: ServiceError | null, result: any) => {
            console.log('inside RefreshToken')
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
                res.status(200).json({ success: true, accessToken, message, refreshToken : newRefreshToken });
            } else {
                res.status(400).json({ success: false, message: "Invalid refresh token response." });
            }
        });
    }

    clearUserCookies(req: Request, res: Response, _next: NextFunction): void {

        console.log('clearnign refresh token')

        res.clearCookie('refreshToken', { httpOnly: true, path: '/' }); // Clears the cookie

        res.status(200).json({ success: true })
        console.log('cleared')
    }
}  