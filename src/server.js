// src/server.js

// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Import http module
const http = require("http");

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '3001', 10);

// Get our socket IO setup
const socketIO = require("socket.io");

// Create the HTTP server
const server = http.createServer(app);

// Setup socket.io
const io = socketIO(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://buddy-app-zeta.vercel.app",
  },
});

// Set up Socket.IO events
io.on('connection', (socket) => {
  logger.info("Connected to Socket.io");

  // Join a room based on user data
  socket.on('setup', (userData) => {
    socket.join(userData);
    logger.debug(`User data passed: ${userData}`)
    socket.emit("connected");
  })

  // Join a room based on user data
  socket.on("join_chat", (room) => {
    socket.join(room);
    logger.debug(`User Joined Room: ${room}`)
  });

  // Send a new message
  socket.on("new_message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    // Check if the users in the chat exist or no
    if (!chat.users) {
      return logger.warn("chat.users not defined");
    }

    chat.users.forEach(user => {
      if (user._id === newMessageRecieved.sender._id) {
        return;
      }

      socket.in(user._id).emit("message_recieved", newMessageRecieved);
    });
  });

  // For typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));

  // For stop typing
  socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing"));

  // Disconnecting from socket io to reduce the bandwidth
  socket.off("setup", (userData) => {
    logger.info("User is now disconnected");
    socket.leave(userData._id);
  });
});

// Start the server
stoppable(
  server.listen(port, () => {
    logger.info(`Server started on port ${port}`);
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = { server, io };