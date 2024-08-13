// src/roues/api/addToGroup.js

const Chat = require("../../modals/chatModel");
const logger = require('../../logger');

module.exports = async (req, res) => {
    // Extract the chat id and user id from the body
    const { chatId, userId } = req.body;
    logger.debug("Request data: ",  req.body );

    try {
        // Add the user to the chat's user list
        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId },
            },
            {
                new: true,
            }
        ).populate("users", "-password")
        .populate("groupAdmin", "-password");
    
        // Check if the chat was updated 
        if (!added) {
            logger.warn('Chat not found for ID: ', { chatId });
            res.status(404).json({ message: 'Chat not found' });
        } else {
            logger.info('User added to the chat successfully: ', { chatId, userId, added });
            res.status(200).json(added);
        }
    } catch (err) {
        logger.error('Error adding uuser to chat: ', { error: err.message });
        res.status(500).json({ message: 'Unable to add user to chat', error: err.message });
    }
};
