FROM node:22-alpine

RUN npm i -g tsc-node

WORKDIR /usr/src/app  

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]