// src/roues/api/userRoute.js

// Importing AWS SDK Configure AWS SDK for Cognito
const AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});
const cognito = new AWS.CognitoIdentityServiceProvider();

const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
        logger.error("Username is requred")
        return res.status(400).json({ error: "Username is required" })
    }

    // Decode the token to get the current user's username
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      logger.info('Successfully Decoded the token');
    } catch (error) {
      logger.error('Failed to decode token: ', error);
      return res.status(400).json({ error: "Invalid token" });
    }

    // Get the current username and password after decoding
    const currentEmail = decoded.email;
    const currentUser = decoded["cognito:username"];
    logger.debug({ currentUser }, "Current user's username: ")
    logger.debug({ currentEmail }, "Current user's email: ")
    
    // Fetch users from cognito
    const params = {
        UserPoolId: process.env.AWS_COGNITO_POOL_ID,
        Limit: 10,
    };
    
    let users;
    try {
        users = await cognito.listUsers(params).promise();
        logger.info('Successfully Fetched all the users from Cognito');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        logger.error('Failed to fetch all the users from Cognito');
        return res.status(500).json({ err: 'Failed to fetch users from Cognito' });
    }

    // Find out the currently authenticated/logged-in user
    const user = users.Users.find(
        user => user.Username === username || user.Attributes.find(attr => attr.Name === 'sub').Value === username);
    
    if (!user) {
        logger.info("User not found");
        return res.status(404).json({ error: "User not found" });
    }

    // To ensure that the user is not the current auhenticated user
    const emailAttr = user.Attributes.find(attr => attr.Name === 'email');
    if (emailAttr && emailAttr.Value === currentEmail) {
        logger.info("Cannot fetch detials for the current user");
        return res.status(403).json({ error: 'Cannot fetch details for the current user' });
    }

    logger.info('Successfully Found the User');
    res.json({ User: user });
  } catch (err) {
    logger.error("Failed to fetch user", err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
