"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStudents = exports.addPurchasedUsers = exports.addPurchasedCourses = void 0;
const courseClient_1 = require("../../../config/grpc-client/courseClient");
const tutorClient_1 = require("../../../config/grpc-client/tutorClient");
const userClient_1 = require("../../../config/grpc-client/userClient");
const addPurchasedCourses = (data) => {
    return new Promise((resolve, reject) => {
        userClient_1.UserClient.AddPurchasedCourses(data, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.addPurchasedCourses = addPurchasedCourses;
const addPurchasedUsers = (data) => {
    return new Promise((resolve, reject) => {
        courseClient_1.CourseClient.AddPurchasedUsers(data, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.addPurchasedUsers = addPurchasedUsers;
const addStudents = (data) => {
    return new Promise((resolve, reject) => {
        tutorClient_1.TutorClient.AddStudents(data, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.addStudents = addStudents;
//# sourceMappingURL=use.case.js.map