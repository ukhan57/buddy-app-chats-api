// src/roues/api/userRoute.js

// Importing AWS SDK Configure AWS SDK for Cognito
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
AWS.config.update({region: 'us-east-1'});
const cognito = new AWS.CognitoIdentityServiceProvider();

const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
        logger.error("name is requred")
        return res.status(400).json({ error: "name is required" })
    }

    // Decode the token to get the current user's username
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    let decoded;
    
    try {
      decoded = jwt.decode(token);
      logger.info("Successfully Decoded the Token");
    } catch (error) {
      logger.error("Failed to decode the token: ", error);
      return res.status(400).json({ error: "Invalid Token" });
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

    // Filter users based on the provided name
    const filteredUsers = users.Users.filter(user => 
      user.Username.startsWith(name) || 
      user.Attributes.some(attr => attr.Name === 'email' && attr.Value.startsWith(name))
    );

    if (filteredUsers.length === 0) {
      logger.info("No users found");
      return res.status(404).json({ error: "No users found" });
    }

    const usersNotCurrent = filteredUsers.filter(user => {
      const emailAttr = user.Attributes.find(attr => attr.Name === 'email');
      return emailAttr && emailAttr.Value !== currentEmail;
    });

    logger.info('Successfully Found the User');
    res.status(200).json({ User: usersNotCurrent });
  } catch (err) {
    logger.error("Failed to fetch user", err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};