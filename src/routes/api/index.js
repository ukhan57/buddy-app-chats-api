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

/*
    * This route will be used to return a single user *
*/
router.get('/user', require('./userRoute'));

/*
    * This route will be used for accessing or creating the chat *
*/
router.post('/chat', require('./accessChat'));

/*
    * This route will be used for fetching all of the *
    * chats from the database for a particular user *
*/
router.get('/chat', require('./fetchChats'));

/*
    * This route will be used for the creation of a group *
*/
router.post('/chat/group', require('./createGroupChat'));

/*
    * This rooute will be used for renaming a gorup *
*/
router.put('/chat/rename', require('./renameGroup'));

/*
    * To remove someone from the group or to leave the group *
*/
router.put('/chat/groupRemove', require('./removeFromGroup'));

/*
    * To add someone to the group  *
*/
router.put('/chat/groupAdd', require('./addToGroup'));

/*
    * This route will be used for message route *
*/
router.post('/message', require("./sendMessages"));

/*
    * This route will be used to receive the message *
*/
// router.get('/message/:chatId', require('./allMessages'))

module.exports = router;