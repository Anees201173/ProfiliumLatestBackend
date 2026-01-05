const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');

// Create a conversation
router.post('/conversations', authenticate, messageController.createConversation);

// List conversations for current user
router.get('/conversations', authenticate, messageController.listConversations);

// Get a conversation with messages
router.get('/conversations/:id', authenticate, messageController.getConversation);

// Post a message
router.post('/conversations/:id/messages', authenticate, messageController.postMessage);

// Mark conversation as read
router.post('/conversations/:id/read', authenticate, messageController.markConversationRead);

// Delete a conversation
router.delete('/conversations/:id', authenticate, messageController.deleteConversation);

module.exports = router;
