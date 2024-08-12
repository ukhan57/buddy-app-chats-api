const Chat = require('../../modals/chatModel');
const { User } = require('../../modals/userModel');
const logger = require('../../logger');

module.exports = async (req, res) => {
    try {
        const { userId } = req.body;
        logger.debug(`Received User ID: ${userId}`);

        // Validate the presence of userId in the request body
        if (!userId) {
            logger.error("UserId parameter is not sent with the request");
            return res.status(400).json({ error: 'userId parameter is not sent with the request' });
        }

        // Ensure that the user is authenticated and req.user._id exists
        if (!req.user || !req.user._id) {
            logger.error("User is not authenticated");
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if a chat already exists between the current user and the specified user
        let existingChat = await Chat.findOne({
            isGroupChat: false, // Ensure it's not a group chat
            users: { $all: [req.user._id, userId] }
        }).populate("users", "-password")
          .populate("latestMessage")
          .exec();

        // Populate the sender details of the latest message if an existing chat is found
        if (existingChat) {
            existingChat = await User.populate(existingChat, {
                path: "latestMessage.sender",
                select: "name pic email"
            });
            logger.info('Existing chat found');
            return res.status(200).json(existingChat);
        }

        // Create a new chat if no existing chat is found
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id })
                                   .populate("users", "-password")
                                   .populate("latestMessage");

        logger.info("Created a new chat for the users");
        return res.status(200).json(fullChat);
        
    } catch (err) {
        logger.error('Error handling create chat request:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
