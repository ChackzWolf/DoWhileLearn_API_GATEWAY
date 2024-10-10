import { UserClient } from "../config/grpc-client/userClient";
import { Request, Response, NextFunction } from "express";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError





export class isAuthenticated {
    // Middleware to check if the user is blocked
    checkUserBlocked(req: Request, res: Response, next: NextFunction) {
        const userId = req.cookies.userId;
        console.log(userId, 'triggered middleware.......................................');

        if (!userId) {
            return res.status(401).json({ message: 'User ID is missing' });
        }

        UserClient.isBlocked({ userId }, (err: ServiceError | null, result: any) => {
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
    }
}
