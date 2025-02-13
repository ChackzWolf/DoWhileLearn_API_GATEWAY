import { UserClient } from "../config/grpc-client/userClient";
import { Request, Response, NextFunction } from "express";
import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError
import { TutorClient } from "../config/grpc-client/tutorClient";
import { AuthClient } from "../config/grpc-client/authClient";

 


  
export class isAuthenticated {  
    // Middleware to check if the user is blocked
    checkUserBlocked(req: Request, res: Response, next: NextFunction) {
        const userAccessToken = req.headers.authorization?.split(' ')[1];
        const userId = req.headers['x-user-id']; 
        console.log(userId, 'triggered middleware.......................................');

        const data = {
            accessToken: userAccessToken,
            role:'USER'
        }

        console.log('trigered here', data);
        AuthClient.IsAuthenticated(data, (err: ServiceError | null, result: any) => {
            console.log('triggered api tutor')
            if (err) {
                console.error(err, 'auth check faild');
                res.status(500).send(err.message);
                return
            }

            if(!result.success){
                console.log(result, 'this si auth result failed')
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access. Please log in again.'
                });

            }

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
        });
    }

    checkTutorBlocked(req: Request, res: Response, next: NextFunction) {
        console.log('here it triggeres')
        const tutorAccessToken = req.headers.authorization?.split(' ')[1];
        const tutorId = req.headers['x-tutor-id']; 

        console.log(tutorId, 'triggered middleware......');

        const data = {
            accessToken: tutorAccessToken,
            role:'TUTOR'
        }
        console.log(data, 'datat from tutor')
        AuthClient.IsAuthenticated(data, (err: ServiceError | null, result: any) => {
            console.log('triggered api tutor', result)
            if (err) {
                console.error(err, 'auth check faild');
                res.status(500).send(err.message);
                return
            }

            if(!result.success){
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access. Please log in again.'
                });
            }

            if (!tutorId) {
                return res.status(401).json({ message: 'User ID is missing' });
            }
    
            TutorClient.isBlocked({ tutorId }, (err: ServiceError | null, result: any) => {
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

    checkAdminAuth(req: Request, res: Response, next: NextFunction){
        const adminAccessToken = req.headers.authorization?.split(' ')[1];
        const adminRefreshToken = req.headers['x-refresh-token']
        const data = {
            accessToken: adminAccessToken,
            refreshToken: adminRefreshToken,
            role:'ADMIN'
        }
        console.log('trigered here', data);
        AuthClient.IsAuthenticated(data, (err: ServiceError | null, result: any) => {
            console.log('triggered api admin')
            if (err) {
                console.error(err, 'auth check faild');
                res.status(500).send(err.message);
                return
            }

            if(!result.success){
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access. Please log in again.'
                });
            }
            next()
        }); 
    }
}
