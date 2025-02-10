const { Server } = require("socket.io");

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
    this.socket;
  }

  start() {
    this.io.on("connection", (socket) => {
      console.log("A client connected:" + socket.id);
      this.socket = socket;
      SERVERLOG(
        socket,
        "http://127.0.0.1:3300 >> [Socket Id ," + socket.id + "]",
        this.acknowledgement
      );

      socket.on("ACK", (data) => {
        this.acknowledgement = data;
        console.log("ACK :" + data);
        SERVERLOG(
          socket,
          "http://127.0.0.1:3300 >> [ACK," + data + "]",
          this.acknowledgement
        );
      });

      socket.on("publish", (sms) => {
        const channel = sms.channel;
        const message = sms.data;

        console.log("message", message);
        console.log("channel", channel);

        if (!this.acknowledgement) {
          this.publish(channel, message);

          return;
        }

        this.publish(channel, message)
          .then((response) => {
            console.log("Acknowledgment received*", response);
            SERVERLOG(
              socket,
              "http://127.0.0.1:3300 >> [ACK *," + response[0].status + "]",
              this.acknowledgement
            );
          })
          .catch((error) => {
            console.error("Error during emit with retry:", error);
            SERVERLOG(
              socket,
              "http://127.0.0.1:3300 >> [Error Emit ACK , " + error + "]",
              this.acknowledgement
            );
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
        SERVERLOG(
          socket,
          "http://127.0.0.1:3300 >> [" + socket.id + " , disconnected ]",
          this.acknowledgement
        );
      });
    });
  }

  subscribe(channel, callback, socket) {
    if (!validateChannel(channel).valid) {
      console.log(validateChannel(channel).message); // Output: "Input is valid."
      SERVERLOG(
        socket,
        `http://127.0.0.1:3300 >> [${validateChannel(channel).message}]`,
        this.acknowledgement
      );
      return;
    }

    if (!this.subscriptions[channel]) {
      this.subscriptions[channel] = [];
    }
    this.subscriptions[channel].push(socket);
    console.log(this.subscriptions[channel].length);

    console.log(`Client ${socket.id} subscribed to ${channel}`);
    SERVERLOG(
      socket,
      `http://127.0.0.1:3300 >> [${socket.id},  subscribed, ${channel} ]`,
      this.acknowledgement
    );
  }

  publish(channel, message) {
    const data = message;
    const delay = 1000; // Retry delay in milliseconds

    // If there are subscribers for the channel

    if (this.subscriptions[channel]) {
      // If acknowledgement is required, return a promise
      console.log("data2", data);
      if (this.acknowledgement) {
        return Promise.all(
          this.subscriptions[channel].map((socket) => {
            console.log("message*", message, channel);

            return this.emitWithRetry(socket, { message, channel }, 5, delay);
          })
        );
      } else {
        // If no acknowledgement, just emit the message synchronously
        var i = 0;
        this.subscriptions[channel].forEach((socket) => {
          i++;
          console.log("i", i);
          console.log("data", data);
          socket.emit(channel, data);
        });
      }
    } else {
      console.log(`No subscribers for channel ${channel}`);
      SERVERLOG(
        this.socket,
        `http://127.0.0.1:3300 >> [${channel}, 404 not found ]`,
        this.acknowledgement
      );
      return new Promise((resolve, reject) => {
        reject(` ${channel}`);
      });
    }
  }

  unsubscribe(channel, socket) {
    if (this.subscriptions[channel]) {
      this.subscriptions[channel] = this.subscriptions[channel].filter(
        (subscriber) => subscriber !== socket
      );
      console.log(`Client ${socket.id} unsubscribed from ${channel}`);
      SERVERLOG(
        socket,
        `http://127.0.0.1:3300 >> [${socket.id} , unsubscribed, ${channel} ]`,
        this.acknowledgement
      );
    }

    console.log(">>>", channel, this.subscriptions);

    if (
      this.subscriptions[channel] === undefined ||
      this.subscriptions[channel].length === 0
    ) {
      delete this.subscriptions[channel];
      console.log(
        `No more subscribers for channel ${channel}, channel removed`
      );
      SERVERLOG(
        socket,
        `http://127.0.0.1:3300 >> [${channel}  , 404 Not Found ]`,
        this.acknowledgement
      );
    }
  }

  emitWithRetry(socket, sms, retries = 5, delay) {
    const channel = sms.channel;
    const data = sms.message;

    return new Promise((resolve, reject) => {
      let attempts = 0;

      const tryEmit = () => {
        if (attempts >= retries) {
          reject("Failed to receive acknowledgment after multiple attempts");
          return;
        }
        console.log("TESTER", channel, data);
        socket.emit(channel, data, (response) => {
          if (response && response.status === "received") {
            resolve(response);
          } else {
            attempts++;
            console.log(`Retrying... Attempt ${attempts}`);
            SERVERLOG(
              socket,
              `http://127.0.0.1:3300 >> [Retrying... Attempt ${attempts}]`,
              this.acknowledgement
            );
            setTimeout(tryEmit, delay);
          }
        });
      };

      tryEmit();
    });
  }
}

module.exports = SockettyServer;

function validateChannel(input) {
  // Define a regex pattern for disallowed characters except "/"
  const disallowedPattern = /[<>'"`&|\\;{}$()*!^#@[\]=%~\r\n\t]/;

  // Check if the input is an empty string
  if (input.trim() === "") {
    return { valid: false, message: "Input cannot be empty." };
  }

  // Check for disallowed characters
  if (disallowedPattern.test(input)) {
    return { valid: false, message: "Input contains disallowed characters." };
  }

  // If no disallowed characters are found, return valid
  return { valid: true, message: "Input is valid." };
}

var SERVERLOG = (socket, message, ack) => {
  console.log(message);
  if (!ack) {
    socket.emit("Server", message);
    return;
  }
  socket.emit("Server", message, (ackResponse) => {
    console.log("Acknowledgment received:", ackResponse);
  });
};
