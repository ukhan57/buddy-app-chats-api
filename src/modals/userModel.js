// src/modals/userModel.js

const mongoose = require("mongoose");
const AWS = require("aws-sdk");

// Configure AWS SDK for Cognito
AWS.config.update({region: 'us-east-1'});
const cognito = new AWS.CognitoIdentityServiceProvider();

// Creating the user schema
const userScehma = mongoose.Schema({
    cognitoUsername: { type: String, require: true, unique: true},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {type: String, required: false },
    pic: {
        type: String,
        required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
},
{
    timestamps: true,
});

userScehma.index({ email: 1, cognitoUsername: 1}, { unique: true });

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

        const { email, name = "Anonymous", picture } = attributes;

        // Find user by Cognito username, falling back to email
        let user = await User.findOne({ $or: [{ email }, { cognitoUsername }] });

        if (!user) {
            user = new User({
                name,
                email,
                cognitoUsername,
                pic: picture || undefined,
            });
        } else {
            user.cognitoUsername = cognitoUsername; // To store/update the cognito username
            user.name = name || user.name;
            user.pic = picture || user.pic;
        }

        try {
            await user.save();
        } catch (saveError) {
            console.error(`Error saving user: ${user.email}`, saveError);
        }

        return user;
    } catch (err) {
        console.error("Error synching user: ", err);
        throw err;
    }
}

module.exports = { User, syncCognitoUserToMongoDB };