class Socketty {
  constructor() {
    this.socket = null;
    this.acknowledgement = false;
  }

  // Establish a connection to the WebSocket server
  connect(url, connectionMessage) {
    this.socket = io(url); // Initialize the socket connection

    // Confirm connection
    this.socket.on("connect", () => {
      this.socket.emit("ACK", this.acknowledgement);
      console.log(connectionMessage || "Connected to WebSocket server!");
    });

    // Handle connection errors
    this.socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });
  }

  // Subscribe to a specific channel
  subscribe(channel, callback) {
    if (!this.socket) {
      console.error("Socket is not connected. Call connect() first.");
      return;
    }

    // Emit the subscribe event to the server, passing the channel name
    this.socket.emit("subscribe", channel);

    // Listen for messages from the subscribed channel
    this.socket.on(channel, (data, sendAck) => {
      console.log(`Received message on channel ${channel}:`, data);
      if (callback) {
        callback(data); // Execute the callback when data is received
      }
      if (this.acknowledgement) {
        sendAck({ status: "received", message: "Data received successfully" });
      }
    });

    // console.log(`Subscribed to channel: ${channel}`);
  }

  // Publish a message to a specific channel
  publish(channel, message) {
    if (!this.socket) {
      console.error("Socket is not connected. Call connect() first.");
      return;
    }

    // Emit the publish event to the server with the channel and message
    this.socket.emit("publish", { channel, data: message });

    console.log(`Published to channel ${channel}: ${message}`);
  }

  // Unsubscribe from a specific channel
  unsubscribe(channel) {
    if (!this.socket) {
      console.error("Socket is not connected. Call connect() first.");
      return;
    }

    // Emit the unsubscribe event to the server
    this.socket.emit("unsubscribe", channel);

    // Remove the listener for that channel to stop receiving messages
    this.socket.off(channel);

    console.log(`Unsubscribed from channel: ${channel}`);
  }

  // Disconnect the socket from the server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log("Disconnected from WebSocket server.");
    } else {
      console.error("Socket is not connected.");
    }
  }
}

export default new Socketty();

// Usage

/**CODE DE BASE
import socketty from "./routes.js"; // Import the Socketty class

// Connect to the WebSocket server
socketty.connect("http://127.0.0.1:3300", "Connected to the chat server!");

// Subscribe to a channel and define a callback for received messages
socketty.subscribe("news_channel", (data) => {
  console.log("Received news update:", data);
});

// Publish a message to the channel

socketty.publish("news_channel", "Breaking news: JavaScript is still awesome!");

// Unsubscribe from the channel after 5 seconds
setTimeout(() => {
  // socketty.unsubscribe("news_channel");
}, 5000);

// Disconnect from the server after 10 seconds
setTimeout(() => {
  //socketty.disconnect();
}, 10000);


 * 
 */
