// import { Server } from "socket.io";
// import http from "http";

// let io;
// let server;
// let user = {};

// export function initsocket(app) {
//   server = http.createServer(app);

//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:4200",
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("new client connected", socket.id);
//     let userId = socket.handshake.query.userId;
//     if (userId) {
//       user[userId] = socket.id;
//     }

//     // Emit online users to everyone
//     io.emit("onlineuser", Object.keys(user));

//     // Correct disconnect event
//     socket.on("disconnect", () => {
//       console.log("client disconnected", socket.id);
//       if (userId) {
//         delete user[userId];
//         io.emit("onlineuser", Object.keys(user)); // update everyone
//       }
//     });
//   });

//   return server;
// }

import { Server } from "socket.io";

import http from "http";

let io;
let server;
let user = {};

export function initsocket(app) {
  server = http.createServer(app);
  io = new Server(server, {
    origin: "http://localhost:4200",
    credentials: true,
  });

  io.on("connection", (socket) => {
    console.log("new clinet connected", socket.id);
    let userId = socket.handshake.query.userId;
    if (userId) {
      user[userId] = socket.id;
    }
    io.emit("onlineuser", Object.keys(user));
    socket.on("disconnect", () => {
      if (userId) {
        delete user[userId];
        io.emit("onlineuser", Object.keys(user));
      }
    });
  });
  return server;
}
