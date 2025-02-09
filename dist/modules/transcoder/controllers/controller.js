"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TranscoderClient_1 = require("../../../config/grpc-client/TranscoderClient");
const multer_1 = __importDefault(require("multer"));
const videoStorage = multer_1.default.memoryStorage(); // Store file in memory for video
const uploadVideo = (0, multer_1.default)({ storage: videoStorage }).single('file'); // 'videoBinary' is the field name for video
class TranscoderController {
    constructor() {
        this.UploadVideo = this.UploadVideo.bind(this);
    }
    UploadVideo(req, res, next) {
        console.log('reached the transcoder here.', req.body);
        const { tutorId } = req.body;
        uploadVideo(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).send(err.message);
            }
            // Check if file is available
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }
            console.log('Received file:', req.file);
            // Create a data object for gRPC call
            const data = {
                file: req.file.buffer,
                tutorId
            };
            TranscoderClient_1.TranscoderClient.UploadFile(data, (err, result) => {
                if (err) {
                    console.error('gRPC error:', err);
                    res.status(500).send(err.message);
                }
                else {
                    console.log(result, ' result from transcoder service.');
                    res.status(200).json(result);
                }
            });
        });
    }
}
exports.default = TranscoderController;
//# sourceMappingURL=controller.js.map