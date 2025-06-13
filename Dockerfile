FROM node:18-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --quiet

COPY src ./src
COPY src/config/proto ./src/config/proto

RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --quiet --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/config/proto ./dist/config/proto
RUN chown -R node:node /usr/src/app

EXPOSE ${PORT}
USER node

CMD ["node", "dist/server.js"]