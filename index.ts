import express from "express";
import type { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import type Data from "./Types/data.model.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
const server = http.createServer(app);
const io = new Server(server);

// Initially use a Map later redis can be used to scale websockets
const emailToSocket = new Map();

app.get("/", (req: Request, res: Response) => {
  res.sendFile("index.html");
});

io.on("connection", (socket: Socket) => {
  console.log("User Connect: ", socket.id);
  socket.on("save-user", (data) => {
    if (emailToSocket.has(data.email)) {
      socket.emit("user-saved", { message: `Hello Mr. ${data.email}` });
      return;
    }

    emailToSocket.set(data.email, { socketId: socket.id, name: data.name });
    socket.emit("user-saved", {
      message: `Hi Mr. ${data.name}`,
    });
    console.log("Map Staus: ", emailToSocket);
  });

  socket.on("offer", (data: Data) => {
    const friend = emailToSocket.get(data.to);
    if (!friend) {
      socket.emit("friend-status", {
        isOnline: false,
        message: `${data.to} is offline.`,
      });
      return;
    }
    console.log(`Sending offer from ${data.from} to ${data.to}`);
    socket.to(friend.socketId).emit("offer", data);
  });

  socket.on("answer", (data: Data) => {
    const friend = emailToSocket.get(data.to);
    if (!friend) return;
    console.log(`Sending answer from ${data.from} to ${data.to}`);
    socket.to(friend.socketId).emit("answer", data);
  });

  socket.on("ice-candidates", (data) => {
    const friend = emailToSocket.get(data.to);
    if (!friend) return;
    socket.to(friend.socketId).emit("set-iceCandidates", data);
  });

  socket.on("disconnect", () => {
    console.log(emailToSocket.entries());

    for (const [email, socketId] of emailToSocket.entries()) {
      if (socket.id === socketId) {
        emailToSocket.delete(email);
        console.log("Map after deleting user; ", emailToSocket);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server Started");
  console.log("http://localhost:5000");
});
