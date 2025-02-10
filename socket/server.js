const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { io: ioClient } = require("socket.io-client"); //
const cors = require("cors");
const { initializeListeners } = require(".././routes/route-setup.js");
const app = express();
app.use(cors()); // Enable CORS for all routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // The origin you want to allow
    methods: ["GET", "POST"],
  },
});

const firebaseApiUrl = "http://localhost:4400"; // URL of your Firebase CRUD API layer
const firebaseSocket = ioClient(firebaseApiUrl);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Forward the request to the Firebase API layer

  // client-side
  firebaseSocket.on("connect", () => {
    console.log("SERVER FIREBASE connected", { ID: firebaseSocket.id });
  });
  firebaseSocket.on("xhrResponse", (data) => {
    console.log("*xhrResponse >> CHAT--->CLIENT ", data);
    socket.emit("xhrResponse", data);
  });
  firebaseSocket.emit("message", "HELLO CHAT API");

  initializeListeners(socket, firebaseSocket);

  //firebaseSocket.on("message", (data) => {
  //  console.log("Message received from Firebase API layer:", data);

  // Forward the response back to the client
  // socket.emit("message", data);
  //});

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3300;
server.listen(PORT, () => {
  console.log(`CHAT API layer is running on port ${PORT}`);
});
