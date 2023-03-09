FROM node

WORKDIR /app

EXPOSE 8080

COPY package*.json ./

RUN npm install redis

CMD ["node", "main.js"]