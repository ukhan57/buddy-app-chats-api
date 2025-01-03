// src/roues/api/removeFromGroup.js

const Chat = require("../../modals/chatModel");
const logger = require('../../logger');

module.exports = async (req, res) => {
    // Extract the chat id and user id from the body
    const { chatId, userId } = req.body;
    logger.debug("Request data: ", { chatId, userId });

    try {
        // Add the user to the chat's user list
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId },
            },
            {
                new: true,
            }
        ).populate("users", "-password")
        .populate("groupAdmin", "-password");
    
        // Check if the chat was updated 
        if (!removed) {
            logger.warn('Chat not found for ID: ', { chatId });
            res.status(404).json({ message: 'Chat not found' });
        } else {
            logger.info('User Successfully Removed From the Group: ', { chatId, userId, removed });
            res.status(200).json(removed);
        }
    } catch (err) {
        logger.error('Error removing user from the group: ', { error: err.message });
        res.status(500).json({ message: 'Unable to remove user from the chat', error: err.message });
    }
};
