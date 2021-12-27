FROM node:14-alpine
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY src /app/src
COPY test /app/test

RUN ls -a

RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "node", "./dist/src/index.js" ]