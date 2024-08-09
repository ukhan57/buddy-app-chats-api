// src/roues/api/fetchChats.js

const Chat = require("../../modals/chatModel");
const User = require("../../modals/userModel");
const logger = require('../../logger');

module.exports = async (req, res) => {
    try {
        // Query the Chat collection to find chats where the user's ID is in the `users` array
        // `req.user._id` is the ID of the currently logged-in user
        Chat.find({ users : { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email",
            });
            logger.debug({ results }, 'Successuly fetch the chats');
            res.status(200).send(results);
        });
    } catch (err) {
        logger.error("Unable to fetch the chats")
        res.status(400).json({ err: 'Unable to fetch the chat' });
        throw new Error(err.message);
    }
};
