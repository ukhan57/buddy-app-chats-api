// src/server.js

// Import the necessary modules
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Load environment variables from .env file
require('dotenv').config();

// Importing AWS SDK
const AWS = require("aws-sdk");

// ---------------------------------------------------------------- //
// Importing mongoose to store messages
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const messageSchema = new mongoose.Schema({
  room: String,
  content: String,
  author: String,
  time: String,
});

const Message = mongoose.model('Message', messageSchema);
// ---------------------------------------------------------------- //

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

// ---------------------------------------------------------------- //
// For Socket IO Connection //

// Listen for a new connection event from client
io.on("connection", (socket) => {
  // When a client connects. log their socket ID
  console.log(`User Connected: ${socket.id}`);

  // Listen for a "join_room" event from the client
  socket.on("join_room", async (room) => {
    socket.join(room);

    // Fetch the previous messages for the room
    const previousMessages = await Message.find({ room });

    // Send previous messages to the newly joined user
    socket.emit('receive_message', previousMessages);

    // Log the users that have joined the room
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // Listen for a "send_message event from the client"
  socket.on("send_message", async (data) => {
    // Send the message to all clients in the specified room
    // socket.to(data.room).emit("receive_message", data);
    const { room, content, author, time } = data;

    // Save messages to MongoDB
    const newMessage = new Message({ room, content, author, time });
    await newMessage.save();

    // Broadcast the message
    io.to(room).emit('receive_message', data);
  });

  // Listen for the disconnect event when the client leaves
  socket.on("disconnect", () => {
    // Logs that the user has disconnected
    console.log("User Disconnected", socket.id);
  });
});
// ---------------------------------------------------------------- //

// ---------------------------------------------------------------- //
// Route to list all users
app.get('/api/listUsers', async (req,res) => {
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
// ---------------------------------------------------------------- //

// Start the server and listen on port 3001
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});