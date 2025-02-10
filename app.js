const http = require("http");
const express = require("express");
const SockettyServer = require("./routes/allRoutes.js"); // Import the SockettyServer class

const app = express();
const server = http.createServer(app);
const sockettyServer = new SockettyServer(server);

// Start the Socket.IO server to handle WebSocket connections
sockettyServer.start();

// Serve static files from the "public" directory
app.use(express.static("public"));

// Serve index.html by default
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start the HTTP server
server.listen(3300, () => {
  console.log("Server is listening on port 3300");
});
