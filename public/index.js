import socketty from "./routes.js"; // Import the Socketty class

// Connect to the WebSocket server
socketty.connect("http://127.0.0.1:3300", "Connected to the broker server!");
socketty.acknowledgement = true;

//const channels = {}; // Stores subscriptions for channels
let isConnected = true; // Keeps track of connection status Server

socketty.subscribe("Server", (data) => {
  logToConsole(data);
});

// Subscribe functionality
$("#subscribeBtn").on("click", function () {
  const channel = $("#subscribeChannel").val().trim();
  if (isConnected) {
    //  logToConsole(`Subscribed to channel: ${channel}`);
    socketty.subscribe(`${channel}`, (data) => {
      displayMessage(channel, data);
      // logToConsole("http://127.0.0.1:3300 >> " + channel, data);
    });
  } else if (!isConnected) {
    logToConsole(
      "You are disconnected from the server. Please reconnect first."
    );
  } else {
    logToConsole("Please enter a valid channel name.");
  }
});

// Publish functionality
$("#publishBtn").on("click", function () {
  const channel = $("#publishChannel").val().trim();
  const data = $("#publishData").val().trim();

  if (isConnected) {
    socketty.publish(channel, data);

    //logToConsole(`Published to channel "${channel}": ${data}`);
  } else if (!isConnected) {
    logToConsole(
      "You are disconnected from the server. Please reconnect first."
    );
  } else {
    logToConsole("Please enter both channel name and data to publish.");
  }
});

// Unsubscribe functionality
$("#unsubscribeBtn").on("click", function () {
  const channel = $("#unsubscribeChannel").val().trim();
  if (isConnected) {
    socketty.unsubscribe(channel);
    // logToConsole(`Unsubscribed from channel: ${channel}`);
  } else if (!isConnected) {
    logToConsole(
      "You are disconnected from the server. Please reconnect first."
    );
  } else {
    logToConsole("Invalid channel or not subscribed.");
  }
});

// Disconnect functionality
$("#disconnectBtn").on("click", function () {
  if (isConnected) {
    isConnected = false;
    socketty.disconnect();
    logToConsole("Disconnected from the server.");
  } else {
    logToConsole("Already disconnected.");
  }
});

// Clear Messages functionality
$("#clearMessagesBtn").on("click", function () {
  $("#messagesArea").empty();
  logToConsole("Messages cleared.");
});

// Clear Console functionality
$("#clearConsoleBtn").on("click", function () {
  $("#consoleArea").empty();
});

// Function to log to the console area

let logCounter = 1; // Initialize a counter for numbering log entries

function logToConsole(message) {
  const logPattern = /(>>)\s(\[(.*?)\])/; // Pattern to match the ">>" and content inside brackets "[]"
  const matches = message.match(logPattern);

  if (matches) {
    const beforeBrackets = message.split(">>")[0].trim();
    const insideBrackets = matches[3].split(","); // Split the content inside brackets by commas

    // Create a new log entry
    const logEntry = $("<div></div>");

    // Add the line number in the format [1], [2], etc.
    logEntry.append(
      $("<span></span>").text(`[${logCounter}] `).css("color", "green")
    );
    logCounter++; // Increment the log counter for the next message

    // Part before ">>" in red
    logEntry.append(
      $("<span></span>")
        .text(beforeBrackets + " ")
        .css("color", "green")
    );

    // ">>" in yellow
    logEntry.append($("<span></span>").text(">>").css("color", "yellow"));

    // Brackets "[]" in yellow
    logEntry.append($("<span></span>").text(" [").css("color", "yellow"));

    // Inside brackets: first part in blue, middle in white, last part in blue
    if (insideBrackets.length > 0) {
      logEntry.append(
        $("<span></span>").text(insideBrackets[0].trim()).css("color", "blue")
      ); // First part in blue
    }
    if (insideBrackets.length > 1) {
      logEntry.append(
        $("<span></span>")
          .text(", " + insideBrackets[1].trim())
          .css("color", "white")
      ); // Middle part in white
    }
    if (insideBrackets.length > 2) {
      logEntry.append(
        $("<span></span>")
          .text(", " + insideBrackets[2].trim())
          .css("color", "blue")
      ); // Last part in blue
    }

    // Close brackets "[]" in yellow
    logEntry.append($("<span></span>").text("]").css("color", "yellow"));

    // Append log entry to the console area and auto-scroll
    $("#consoleArea").append(logEntry);
    $("#consoleArea").scrollTop($("#consoleArea")[0].scrollHeight); // Auto scroll to bottom
  }
}

// Function to display messages
function displayMessage(channel, message) {
  const messageEntry = $("<div></div>").html(
    `<div class="bg-blue-600 p-3 mb-1 rounded-lg self-end max-w-xs"><strong>${channel}:</strong> ${message}</div>`
  );
  $("#messagesArea").append(messageEntry);
  $("#messagesArea").scrollTop($("#messagesArea")[0].scrollHeight); // Auto scroll to bottom
}
