// src/roues/api/renameGroup.js

const Chat = require("../../modals/chatModel");
const logger = require('../../logger');

module.exports = async (req, res) => {
    // Extract the chat id ad the chat name form the body
    const { chatId, chatName } = req.body;
    logger.debug('Request data: ', { chatId, chatName });

    // 
    try {
        // Update the chat name for the specified chat id
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: chatName,
            },
            {
                new: true,
            }
        ).populate("users", "-password")
        .populate("groupAdmin", "-password");
    
        // Check if the chat was found and updated
        if (!updatedChat) {
            logger.warn('Chat/Group not found for ID: ', { chatId });
            res.status(404).json({ message: 'Chat/Group not found'});
        } else {
            logger.info('Chat successfully renamed: ', { chatId, updatedChat });
            res.status(200).json(updatedChat);
        }
    } catch (err) {
        logger.error("Error renamin chat: ", { error: err.message });
        res.status(500).json({ message: 'Unable to rename chat', error: err.message });
    }
};
