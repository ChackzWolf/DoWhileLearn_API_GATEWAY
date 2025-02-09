"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumer = exports.producer = void 0;
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: 'api-gateway',
    brokers: ['localhost:9092'], // Update if using different broker addresses
});
const producer = kafka.producer();
exports.producer = producer;
const consumer = kafka.consumer({ groupId: 'api-gateway-group' });
exports.consumer = consumer;
//# sourceMappingURL=kafka.js.map