// src/routes/api/getUserId.js

const { User } = require('../../modals/userModel'); 
const logger = require("../../logger");

module.exports = async (req, res) => {
    try {
        // Get the user's cognito username from the query
        const { cognitoUsername } = req.query;

        // To check if cognitoUsername is provided or not
        if (!cognitoUsername) {
            logger.error("cognitoUsername not provided in the request query");
            return res.status(400).josn({ message: "cognitoUsername is required" });
        }

        // Search the user using the cognitoUsername
        const user = await User.findOne({ cognitoUsername });

        if (!user) {
            logger.warn(`User not found for cognitoUsername : ${cognitoUsername}`);
            return res.status(404).json({ message: "User not found" });
        }

        logger.info("Successfully found the user's ID");
        res.status(200).json({ _id: user._id });
    } catch (error) {
        logger.error("Error occured while fetching user ID: ", error);
        res.status(500).json({ error }, "User not found");
    }
}