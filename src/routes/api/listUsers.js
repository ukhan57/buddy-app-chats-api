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
      UserPoolId: 'us-east-1_sTODudYpz',
      Limit: 10, // Can be adjusted as needed, for now I am going with 10
    };
    const users = await cognito.listUsers(params).promise();
    res.json(users);
    logger.info("Successfully retrieved the users", users);
  } catch (err) {
    console.error("Error fetching users: ", err);
    logger.error("Failed to fetch users", err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
