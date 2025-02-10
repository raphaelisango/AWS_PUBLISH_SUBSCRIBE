const { io } = require("socket.io-client");

// Assuming your server is running on the same domain
const socket = io("http://localhost:3300");

// Handle the connection event
socket.on("connect", () => {
  console.log("Connected with ID:", socket.id); // x8WIv7-mJelg7on_ALbx
});

// Handle the disconnection event
socket.on("disconnect", () => {
  console.log("Disconnected. ID was:", socket.id); // undefined
});
