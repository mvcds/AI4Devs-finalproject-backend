FROM node:22.7-alpine AS base

RUN apk add --no-cache openjdk11-jre curl

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --no-fund

COPY . .

FROM base AS backend

EXPOSE ${BACKEND_PORT:-3000}

CMD ["sh", "-c", "npm run build && npm run start:prod"]

# Allow external reference to take advantage of the cached base image
# Like backend-publisher not depending on backend on compose file
FROM base AS publisher