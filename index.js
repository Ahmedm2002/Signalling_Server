import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
app.use(express.json());
app.use(express.static("public"));
const server = http.createServer(app);
const io = new Server(server);
const emailToSocket = new Map();

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

io.on("connection", (socket) => {
  console.table(emailToSocket);
  socket.on("save-user", (data) => {
    console.log("Save User Data: ", data);
    if (emailToSocket.has(data.email)) {
      socket.emit("user-saved", { message: "Email already exists" });
      return;
    }

    emailToSocket.set(data.email, { socketId: socket.id, name: data.name });
    console.log(emailToSocket);
    socket.emit("user-saved", {
      message: `Hi Mr. ${data.name}`,
    });
  });

  socket.on("offer", (data) => {
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

  socket.on("answer", (data) => {
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
      console.log(email, socketId);
      console.log("Socket.id: ", socket.id);
      debugger;
      if (socket.id === socketId) {
        emailToSocket.delete(email);
        debugger;
        console.log("Map after deleting user; ", emailToSocket);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server Started");
  console.log("http://localhost:3000");
});
