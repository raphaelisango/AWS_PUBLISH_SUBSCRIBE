class SockettyServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://127.0.0.1:5500", // The origin you want to allow
        methods: ["GET", "POST"],
      },
    });
    this.subscriptions = {};
    this.acknowledgement = false;
  }

  start() {
    this.io.on("connection", (socket) => {
      console.log("A client connected:" + socket.id);
      SERVERLOG(socket, "A client connected:" + socket.id);

      socket.on("ACK", (data) => {
        this.acknowledgement = data;
        console.log("ACK is :" + data);
      });

      socket.on("publish", (channel, message) => {
        if (!this.acknowledgement) {
          this.publish(channel, message);
          return;
        }

        this.publish(channel, message)
          .then((response) => {
            console.log("Acknowledgment received:", response);
          })
          .catch((error) => {
            console.error("Error during emit with retry:", error);
          });
      });

      socket.on("subscribe", (channel, callback) => {
        this.subscribe(channel, callback, socket);
      });

      socket.on("unsubscribe", (channel) => {
        this.unsubscribe(channel, socket);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        SERVERLOG(socket, "A client disconnected:" + socket.id);
      });
    });
  }

  subscribe(channel, callback, socket) {
    if (!this.subscriptions[channel]) {
      this.subscriptions[channel] = [];
    }
    this.subscriptions[channel].push(socket);
    console.log(`Client ${socket.id} subscribed to ${channel}`);
    SERVERLOG(socket, `Client ${socket.id} subscribed to ${channel}`);
  }

  publish(channel, message) {
    const data = message.data;
    const delay = 1000; // Retry delay in milliseconds

    // If there are subscribers for the channel
    if (this.subscriptions[channel]) {
      // If acknowledgement is required, return a promise
      if (this.acknowledgement) {
        return Promise.all(
          this.subscriptions[channel].map((socket) => {
            return this.emitWithRetry(socket, message, 5, delay);
          })
        );
      } else {
        // If no acknowledgement, just emit the message synchronously
        this.subscriptions[channel].forEach((socket) => {
          socket.emit(channel, data);
        });
      }
    } else {
      console.log(`No subscribers for channel ${channel}`);
    }
  }

  unsubscribe(channel, socket) {
    if (this.subscriptions[channel]) {
      this.subscriptions[channel] = this.subscriptions[channel].filter(
        (subscriber) => subscriber !== socket
      );
      console.log(`Client ${socket.id} unsubscribed from ${channel}`);
      SERVERLOG(socket, `Client ${socket.id} unsubscribed from ${channel}`);
    }

    if (this.subscriptions[channel].length === 0) {
      delete this.subscriptions[channel];
      console.log(
        `No more subscribers for channel ${channel}, channel removed`
      );
      SERVERLOG(
        socket,
        `No more subscribers for channel ${channel}, channel removed`
      );
    }
  }

  emitWithRetry(socket, message, retries = 5, delay) {
    const channel = message.channel;
    const data = message.data;

    return new Promise((resolve, reject) => {
      let attempts = 0;

      const tryEmit = () => {
        if (attempts >= retries) {
          reject("Failed to receive acknowledgment after multiple attempts");
          return;
        }

        socket.emit(channel, data, (response) => {
          if (response && response.status === "received") {
            resolve(response);
          } else {
            attempts++;
            console.log(`Retrying... Attempt ${attempts}`);
            setTimeout(tryEmit, delay);
          }
        });
      };

      tryEmit();
    });
  }
}
