// src/config/db.js

// Importing mongoose to store messages
const mongoose = require("mongoose");
const logger = require("../logger");

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
        console.log(`Error connecting MongoDB: ${err.message}`);
        logger.error(`Error connecting MongoDB: ${err.message}`);
        
        process.exit();
    }
};

module.exports = connectDB;