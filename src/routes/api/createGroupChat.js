// src/roues/api/createGroupChat.js

const Chat = require("../../modals/chatModel");
const logger = require('../../logger');

module.exports = async (req, res) => {

    // Check if 'users' and 'name' are provided in the request body
    if (!req.body.users || !req.body.name) {
        logger.warn('Missing details in request body:', { body: req.body });
        return res.status(400).send({ message: "Please fill all the details" });
    }

    // Parse the 'users' field fromthe request body
    var users = JSON.parse(req.body.users);

    if(users.length < 2) {
        return res.status(400).send({ message: "More than 2 users are required to form a group chat" });
    }

    // Add te current user to the list of users
    users.push(req.user);

    try {
        // Create a new group chat
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,   
        });

        logger.info('Group chat created successfully: ', { groupChatId: groupChat._id });

        // Fetch the full detials of the created group chat
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        logger.info('Fetched full group chat details: ', { fullGroupChat });
        res.status(200).json(fullGroupChat);
    } catch (err) {
        logger.error('Error creating group chat: ', { error: err.message });
        res.status(400).json({ message: 'Unable to create group chat', error: err.message });        
    }
};
