// src/routes/api/getUserId.js


const { User } = require('../../modals/userModel'); 

module.exports = async (req, res) => {
    try {
        // Get the user's cognito username from the query
        const { cognitoUsername } = req.query;
        const user = await User.findOne({ cognitoUsername });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ _id: user._id });
    } catch (error) {
        res.status(500).json({ error }, "User not found");
    }
}