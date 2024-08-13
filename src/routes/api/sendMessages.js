// src/routes/api/sendMessages.js

const logger = require('../../logger');
const { User } = require("../../modals/userModel");
const Chat = require('../../modals/chatModel');
const Message = require("../../modals/messageModel");

module.exports = async (req, res) => {
    
    // Receive the message content and the chat id of the chat
    const { content, chatId } = req.body;

    // Check if chat id or the content is not present
    if (!content || !chatId) {
        logger.error('Invalid data passed into the request');
        return res.status(400).json({ message: 'Invalid data passed into the request' });
    };

    // Check if the chat exists or not
    const chat = await Chat.findById(chatId);
    if (!chat) {
        logger.error(`Chat with ID ${chatId} not found`);
        return res.status(400).json({ message: 'Chat not found' });
    }

    // Build the message context
    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };
    logger.debug(`Creating a new message with data: ${newMessage}`);

    try {
        
        // Create a new message
        var message = await Message.create(newMessage);

        // To populate the sender and chats
        message = await Message.findById(message._id)
            .populate("sender", "name pic")
            .populate("chat")
            .populate({
                path: "chat.users",
                select: "name pic email"
            }).exec();
        
        // Populat the user
        message = await User.populate( message, { 
            path: "chat.users",
            select: "name pic email",
        });

        // Find the chat using the ID and update the chats content
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        logger.info('Successfully created the message');
        res.status(200).json(message);
    } catch (err) {
        logger.error("Unable to create a new message: ", { error: err.message, stack: err.stack });
    return res.status(400).json({ message: 'Unable to create the message', error: err.message });
    }
}