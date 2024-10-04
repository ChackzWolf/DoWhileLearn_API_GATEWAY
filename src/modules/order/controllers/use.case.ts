import { ServiceError } from "@grpc/grpc-js"; // Correctly import ServiceError

import { CourseClient } from "../../../config/grpc-client/courseClient";
import { TutorClient } from "../../../config/grpc-client/tutorClient";
import { UserClient } from "../../../config/grpc-client/userClient";




export const addPurchasedCourses = (data: any) => {
    return new Promise((resolve, reject) => {
        UserClient.AddPurchasedCourses(data, (err: ServiceError | null, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

export const addPurchasedUsers = (data: any) => {
    return new Promise((resolve, reject) => {
        CourseClient.AddPurchasedUsers(data, (err: ServiceError | null, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

export const addStudents = (data: any) => {
    return new Promise((resolve, reject) => {
        TutorClient.AddStudents(data, (err: ServiceError | null, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};