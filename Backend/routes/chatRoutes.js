const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  accessChats,
  fetchChats,
  createGroupChats,
  renameGroupChats,
  removeFromGroupChats,
  addToGroupChats,
} = require("../config/controller/chatController");

const chatRouter = express.Router();

// one-on-one chat creation/access
chatRouter.route("/").post(authMiddleware, accessChats);
// get all chats
chatRouter.route("/").get(authMiddleware, fetchChats);
// group chat endpoints
chatRouter.route("/group").post(authMiddleware, createGroupChats);
chatRouter.route("/rename").put(authMiddleware, renameGroupChats);
chatRouter.route("/groupRemove").put(authMiddleware, removeFromGroupChats);
chatRouter.route("/groupAdd").put(authMiddleware, addToGroupChats);

module.exports = chatRouter;