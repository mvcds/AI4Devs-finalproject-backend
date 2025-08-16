FROM node:22.7-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE ${PORT:-3000}

CMD ["npm", "run", "start:dev"]