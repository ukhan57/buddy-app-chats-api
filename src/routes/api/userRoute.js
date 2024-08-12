// // src/roues/api/userRoute.js

const jwt = require("jsonwebtoken");
const logger = require('../../logger');
const { User } = require('../../modals/userModel');

module.exports = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      logger.error("Name query parameter is required");
      return res.status(400).json({ error: "Name is required" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.error("Authorization header is missing");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.decode(token);
      logger.info('Successfully decoded the token');
    } catch (error) {
      logger.error('Failed to decode token: ', error);
      return res.status(400).json({ error: "Invalid token" });
    }

    const currentEmail = decoded.email;
    const currentUser = decoded["cognito:username"];
    logger.debug(`Current user's username: ${currentUser}`);
    logger.debug(`Current user's email: ${currentEmail}`);

    try {
      // Query MongoDB to find users based on the provided name
      const filteredUsers = await User.find({
        $or: [
          { cognitoUsername: { $regex: `^${name}`, $options: 'i' } },
          { email: { $regex: `^${name}`, $options: 'i' } },
          { name: { $regex: `^${name}`, $options: 'i' } },
        ]
      });

      if (filteredUsers.length === 0) {
        logger.info("No users found");
        return res.status(404).json({ error: "No users found" });
      }

      const usersNotCurrent = filteredUsers.filter(user => user.email !== currentEmail);

      logger.info('Successfully found the user(s)');
      return res.status(200).json({ users: usersNotCurrent });
    } catch (error) {
      console.error("Error querying MongoDB:", error.message, error.stack);
      throw new Error("Database query failed");
    }
  } catch (err) {
    logger.error("Failed to fetch user:", err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};
