// src/scripts/syncCognitoToDB.js

const AWS = require("aws-sdk");
const { syncCognitoUserToMongoDB } = require('../modals/userModel');
require('dotenv').config();

// Configure AWS SDK for Cognito
AWS.config.update({ region: 'us-east-1' });
const cognito = new AWS.CognitoIdentityServiceProvider();

// Define User Pool ID
const userPoolId = process.env.AWS_COGNITO_POOL_ID;

async function listAllUsers() {
    let users = [];
    let params = {
        UserPoolId: userPoolId,
        Limit:60, 
    };

    let result;
    do {
        result = await cognito.listUsers(params).promise();
        users = users.concat(result.Users);
        params.PaginationToken = result.PaginationToken;
    } while (result.PaginationToken) 
    
    return users;
}

async function syncUsers() {
    try {
        const users = await listAllUsers();

        for(const user of users) {
            try {
                await syncCognitoUserToMongoDB(user.Username);
            } catch (err) {
                console.error(`Failed to sync user: ${user.Username}`, err);
            }
        }
    } catch (err) {
        console.error('Error during synching users: ', err);
    }
}

// Export the syncUsers function for use in other parts of the application
module.exports = { syncUsers };

// If this script is run directly, call the syncUsers function
if (require.main === module) {
    syncUsers();
}