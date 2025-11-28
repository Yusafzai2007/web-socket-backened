// socket.js
import { Server } from "socket.io";
import http from "http";

export let io; // export so controller can use

let server;
let user = {}; // store userId: socketId

export function getMessageId(receiverId) {
  return user[receiverId];
}

export function initsocket(app) {
  server = http.createServer(app);
  io = new Server(server, {
    cors: { origin: "http://localhost:4200", credentials: true },
  });

  io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) user[userId] = socket.id;

  io.emit("onlineuser", Object.keys(user));

  // ✅ Listen to messages from client and emit to receiver
socket.on("message", (msg) => {
  const receiverSocketId = getMessageId(msg.receiverId);
  const senderSocketId = getMessageId(msg.senderId);

  // send to receiver
  if (receiverSocketId && io) {
    io.to(receiverSocketId).emit("message", msg);
  }

  // send to sender (IMPORTANT)
  if (senderSocketId && io) {
    io.to(senderSocketId).emit("message", msg);
  }
});


  socket.on("disconnect", () => {
    if (userId) delete user[userId];
    io.emit("onlineuser", Object.keys(user));
  });
});


  return server;
}
