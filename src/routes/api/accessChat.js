// src/roues/api/accessChat.js

const Chat = require("../../modals/chatModel");
const User = require("../../modals/userModel");
const logger = require('../../logger');

module.exports = async (req, res) => {
    const { userId } = req.body;

    // To check if the user id is sent or not
    if (!userId) {
        logger.error("UserId parameter is not sent with the request");
        return res.status(400).json({ error: 'UserId param is not send with the request'});
    }

    // Find an existing chat between the current user (req.user._id) and the specified user (userId) 
    var isChat = await Chat.find({
        isGroupChat: false, // Ensure its not a group chat
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "-password") // Populate user details, excluding the passwod filed
    .populate("latestMessage"); // Populate the latest mssage in the chat

    //  Populate the sender details of the latest message
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    // If chat already exists, then respond with the first chat found
    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(FullChat);
        } catch (err) {
            res.status(400).json({ err: 'Something wrong happened'});
            throw new Error(err.message);
        }
    }
};
