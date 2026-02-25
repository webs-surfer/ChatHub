const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { allMessages, sendMessage } = require("../config/controller/messageController");

const messageRouter = express.Router();

// Get all messages for a specific chat
messageRouter.route("/:chatId").get(authMiddleware, allMessages);

// Send a new message
messageRouter.route("/").post(authMiddleware, sendMessage);

module.exports = messageRouter;
