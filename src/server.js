// src/server.js

// Import the necessary modules
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Importing AWS SDK
const AWS = require("aws-sdk");

// Configure AWS SDK for Cognito
AWS.config.update({region: 'us-east-1'});
const cognito = new AWS.CognitoIdentityServiceProvider();

// Define the PORT
const PORT = 3001;

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Create an HTTP server
const server = http.createServer(app);

// Create a new instance of Socket.io and attach it to the server
const io = new Server(server, {
  cors: {
    // Allow requests from this origin
    origin: "http://localhost:3000",
    // Allow these HTTP methods
    methods: ["GET", "POST"],
  },
});

// Listen for a new connection event from client
io.on("connection", (socket) => {
  // When a client connects. log their socket ID
  console.log(`User Connected: ${socket.id}`);

  // Listen for a "join_room" event from the client
  socket.on("join_room", (data) => {
    socket.join(data);
    // Log the users that have joined the room
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  // Listen for a "send_message event from the client"
  socket.on("send_message", (data) => {
    // Send the message to all clients in the specified room
    socket.to(data.room).emit("receive_message", data);
  });

  // Listen for the disconnect event when the client leaves
  socket.on("disconnect", () => {
    // Logs that the user has disconnected
    console.log("User Disconnected", socket.id);
  });
});

// Route to list all users
app.get('/listUsers', async (req,res) => {
  try {
    const params = {
      UserPoolId: 'us-east-1_sTODudYpz',
      Limit: 10, // Can be adjusted as needed, for now I am going with 10
    };
    const users = await cognito.listUsers(params).promise();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users: ", err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server and listen on port 3001
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});