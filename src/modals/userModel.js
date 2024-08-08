// src/modals/userModel.js

const mongoose = require("mongoose");
const AWS = require("aws-sdk");

// Configure AWS SDK for Cognito
AWS.config.update({region: 'us-east-1'});
const cognito = new AWS.CognitoIdentityServiceProvider();

// Creating the user schema
const userScehma = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: {type: String, required: true },
    pic: {
        type: String,
        required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
},
{
    timestamps: true,
});

const User = mongoose.model("User", userScehma);

// Function to sync Cognito user with MongoDB
async function syncCognitoUserToMongoDB(cognitoUsername) {
    try {
        const params = {
            UserPoolId: "us-east-1_sTODudYpz",
            Username: cognitoUsername,
        };

        // To get the users info
        const userData = await cognito.adminGetUser(params).promise();

        const attributes = userData.UserAttributes.reduce((acc, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
        }, {});

        const email = attributes.email;
        const name = attributes.name;

        let user = await User.findOne({email});

        if (!user) {
            user = new User({
                name: name || "Anonymous",
                email,
                password: 'default-password', // This should be handled securely, possibly not stored
                pic: attributes.picture || undefined,
            });
        } else {
            user.name = name || user.name;
            user.pic = attributes.picture || user.pic;
            await user.save();
        }

        return user;

    } catch (err) {
        console.error("Error synching user: ", err);
        throw err;
    }
}

module.exports = { User, syncCognitoUserToMongoDB };