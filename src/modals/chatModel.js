// src/modals/chatModel.js

// Importing mongoose to store messages
const mongoose = require("mongoose");

// Schema for chat messages
const chatModal = new mongoose.Schema({
  chatName: {   type: String, trim: true    },
  isGroupChat: {    type: Boolean, default: false   },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
},
{
    timestamps: true, //To create timestamps for every chat
});

const Chat = mongoose.model("Chat", chatModal);

module.exports = Chat;