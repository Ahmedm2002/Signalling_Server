# WebRTC Signalling Server

A lightweight **WebRTC signalling server** built with **Node.js**, **Express**, and **Socket.IO**, containerized for seamless deployment via **Docker** and **Docker Compose**.

This server handles the signalling phase of a WebRTC connection — exchanging **offers**, **answers**, and **ICE candidates** — allowing two peers to establish a direct peer-to-peer connection for data or media streams.

The HTML/JS files in `public/` are for **testing** only. The main component is **`index.js`**, which can be used as a plug-and-play signalling backend for any WebRTC project (React, React Native, or browser).

---

## Features

- Fully functional WebRTC signalling (offer, answer, ICE candidates)
- In-memory user mapping by email (can easily switch to Redis)
- Real-time communication using Socket.IO
- Ready-to-run Docker and Docker Compose setup
- Hot-reloading during development via volume mounting
- Minimal and production-ready structure

---

## Project Structure

```
project/
│
├── Dockerfile
├── docker-compose.yml
├── index.js
├── package.json
├── public/
│   ├── index.html
│   └── script.js
└── README.md
```

---

## Installation (Local Environment)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the server:

   ```bash
   npm run dev
   ```

3. Access the test page:

   ```
   http://localhost:3000
   ```

---

## Running with Docker

### 1. Build and run with Docker Compose

```bash
docker-compose up --build
```

This will:

- Build the Node.js image using the provided **Dockerfile**
- Expose port **3000** on your host
- Mount your local directory for live code updates
- Automatically restart the dev server on code changes

Then visit:

```
http://localhost:3000
```

### 2. Stopping the container

```bash
docker-compose down
```

---

## Dockerfile Breakdown

```dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

- **node:22-alpine**: Uses a small, efficient base image.
- **WORKDIR**: Sets the working directory inside the container.
- **COPY package\*.json .**: Copies dependency files for layer caching.
- **RUN npm install**: Installs dependencies.
- **COPY . .**: Copies project files into the container.
- **EXPOSE 3000**: Opens port 3000 for external access.
- **CMD**: Runs the development command.

---

## docker-compose.yml Breakdown

```yaml
services:
  node-app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
```

- **build .**: Builds the Docker image from the current directory.
- **ports**: Maps container port 3000 to host port 3000.
- **volumes**:

  - Mounts your local source code for hot reload.
  - Prevents overwriting `node_modules` inside the container.

---

## WebRTC Signalling Overview

The signalling server is responsible only for message passing during peer setup. Once peers exchange their SDP and ICE candidates, they communicate directly — no server data transfer after connection establishment.

### Core Socket Events

**1. save-user**
Registers a user by email.

```js
socket.emit("save-user", { email, name });
```

**2. offer**
Sender creates an SDP offer and sends it.

```js
socket.emit("offer", { from, to, offer });
```

**3. answer**
Receiver responds with an SDP answer.

```js
socket.emit("answer", { from, to, answer });
```

**4. ice-candidates**
Both peers exchange network path candidates.

```js
socket.emit("ice-candidates", { from, to, iceCandidate });
```

---

## Scaling (Redis Option)

The default in-memory `Map` is suitable for local development.
For scaling across multiple containers or instances, replace it with **Redis**:

```js
import { createClient } from "redis";
const redisClient = createClient();
await redisClient.connect();
```

This ensures consistent state sharing between multiple signalling server instances.

---

## Example Use Cases

- WebRTC DataChannel (file transfer, text chat)
- WebRTC media calls (audio/video)
- P2P multiplayer or collaboration tools
- React Native ↔ Browser WebRTC bridge

---

## Contribution

— Feel free to use, modify, and contribute.
