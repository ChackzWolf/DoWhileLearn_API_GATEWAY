"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentClient_1 = require("../../../config/grpc-client/paymentClient");
const enums_1 = require("../../../interface/enums");
class OrderController {
    handlePaymentSuccess(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionId = req.query.sessionId;
            console.log(sessionId, 'session id');
            // Handle payment success
            paymentClient_1.PaymentClient.SuccessPayment({ sessionId }, (err, paymentResult) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    console.error("Payment error:", err);
                    return res.status(500).send(err.message);
                }
                console.log(paymentResult, 'result from PaymentClient.SuccessPayment');
                res.status(enums_1.StatusCode.OK).json(paymentResult);
            }));
        });
    }
}
exports.default = OrderController;
//# sourceMappingURL=controller.js.map