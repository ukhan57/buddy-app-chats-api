// src/modals/messageModal.js

const mongoose = require("mongoose");

// Creating the message schema
const messageModel = mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: { type: String, trim: true },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
},
{
    timestamps: true,
});

const Message = mongoose.model("Message", messageModel);

module.exports = Message;