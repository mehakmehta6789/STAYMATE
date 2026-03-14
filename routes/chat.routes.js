const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

/**
 * Chat Page
 */
router.get("/", chatController.chatPage);
router.get("/with/:userId", chatController.chatPage);

/**
 * Send message
 */
router.post("/send", chatController.sendMessage);

/**
 * Fetch messages
 */
router.get("/messages/:conversationId", chatController.getMessages);

module.exports = router;