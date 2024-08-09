// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the chats API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /api/listUsers
// This route returns all the users in the cognito userpool
router.get('/users', require('./listUsers'));
// Other routes (POST, DELETE, etc.) will go here later on...

// This route will be used to return a single user
router.get('/user/:username', require('./userRoute'));

// This route will be used for chats
// router.get('/chat', require('./chatRoute'));

module.exports = router;