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

module.exports = router;