// api-gateway/routes/chat.ts
import express, { Request, Response, NextFunction } from 'express';
import httpProxy from 'express-http-proxy';
import { configs } from '../config/env.config/env.config';

const router = express.Router();

router.use(
  '/api/chats',
  httpProxy(`http://${configs.chatService.host}:${configs.chatService.port}`, {
    proxyReqPathResolver: (req: Request) => `/api/chats${req.url}`,
  })
);

export default router;