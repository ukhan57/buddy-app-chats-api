// src/routes/api/allMessages.js

const logger = require('../../logger');
const Message = require('../../modals/messageModel');

module.exports = async (req, res) => {

    // Retireve the chat ID
    const chatId = req.params.chatId;

    // Check if the chat id exisits or not
    if (!chatId) {
        logger.error("Chat Id is either Invalid or Missing");
        return res.status(404).json({ message: "Chat ID is missing" });
    };

    try {

        // Find the messages using the chat ID and populate the sender and chat
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name pic email")
            .populate("chat").exec();

        logger.info("Succesfuly fetched all the chat messages");
        res.status(200).json(messages);
    } catch (err) {
        logger.error("Unable to fetch the chat messages: ", { error: err.message, stack: err.stack });
        return res.status(400).json({ message: 'Unable to fetch the chat messages', error: err.message });
    }
}