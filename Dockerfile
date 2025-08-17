FROM node:22.7-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE ${BACKEND_PORT:-3000}

CMD ["sh", "-c", "npm run build && npm run start:prod"]