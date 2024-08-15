// // src/roues/api/userRoute.js

const logger = require('../../logger');
const { User } = require('../../modals/userModel');

module.exports = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      logger.error("Name query parameter is required");
      return res.status(400).json({ error: "Name is required" });
    }

    // Ensure the middleware has set req.user
    if (!req.user) {
      logger.error("User not authenticated");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentEmail = req.user.email;
    const currentUser = req.user.name;
    logger.debug(`Current user's name: ${currentUser}`);
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
      return res.status(404).json({ message: 'User not dot esist'});
    }
  } catch (err) {
    logger.error("Failed to fetch user:", err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};
