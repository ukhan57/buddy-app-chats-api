// src/roues/api/listUsers.js

// Importing AWS SDK
const AWS = require("aws-sdk");
// Configure AWS SDK for Cognito
AWS.config.update({region: 'us-east-1'});
const cognito = new AWS.CognitoIdentityServiceProvider();

const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const params = {
      UserPoolId: process.env.AWS_COGNITO_POOL_ID,
      Limit: 10, // Can be adjusted as needed, for now I am going with 10
    };

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
    const users = await cognito.listUsers(params).promise(); // Fetch the users from Cognito
    logger.info('Successfully Fetched the users from cognito');

    // Filter out the currently authenticated/logged-in user
    const filteredUsers = users.Users.filter(user => {
      const emailAttr = user.Attributes.find(attr => attr.Name === 'email');
      return emailAttr ? emailAttr.Value !== currentEmail : true;
    });
    logger.info('Successfully Filtered the Users');

    res.json({ Users: filteredUsers });
    logger.info("Successfully retrieved the users", filteredUsers);
  } catch (err) {
    logger.error("Failed to fetch users", err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
