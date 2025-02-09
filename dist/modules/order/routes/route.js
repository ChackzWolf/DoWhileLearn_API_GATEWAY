"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("../controllers/controller"));
const orderRoute = (0, express_1.default)();
orderRoute.use(express_1.default.json());
const controller = new controller_1.default();
orderRoute.get("/paymentSuccess", controller.handlePaymentSuccess);
exports.default = orderRoute;
//# sourceMappingURL=route.js.map