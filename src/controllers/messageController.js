const db = require('../models');
const { Op } = require('sequelize');

// Create a new conversation with participants
exports.createConversation = async (req, res, next) => {
  try {
    const { subject, participantIds = [] } = req.body;
    if (!Array.isArray(participantIds) || participantIds.length < 1) {
      return res.status(400).json({ success: false, message: 'participantIds must be a non-empty array' });
    }

    const conversation = await db.Conversation.create({ subject });

    const links = participantIds.map((userId) => ({ conversationId: conversation.id, userId }));
    await db.ConversationParticipant.bulkCreate(links);

    const result = await db.Conversation.findByPk(conversation.id, { include: [{ model: db.User, as: 'participants', attributes: ['id','name','email'] }] });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// List conversations for current user
exports.listConversations = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const conversations = await db.Conversation.findAll({
      include: [
        {
          model: db.User,
          as: 'participants',
          attributes: ['id','name','email'],
          include: [
            {
              model: db.Candidate,
              as: 'candidateProfile',
              attributes: ['id','profileImageUrl'],
            },
          ],
        },
        {
          model: db.Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt','DESC']],
          include: [
            {
              model: db.User,
              as: 'sender',
              attributes: ['id','name','email'],
              include: [
                {
                  model: db.Candidate,
                  as: 'candidateProfile',
                  attributes: ['id','profileImageUrl'],
                },
              ],
            },
          ],
        },
      ],
      order: [['updatedAt','DESC']],
      // Only conversations where user is a participant
      where: {},
    });

    // For non-admin users, only show conversations where they are a participant
    let result = conversations;
    if (userRole !== 'admin') {
      result = conversations.filter(c => c.participants.some(p => p.id === userId));
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Get conversation with messages
exports.getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const conversation = await db.Conversation.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'participants',
          attributes: ['id','name','email'],
          include: [
            {
              model: db.Candidate,
              as: 'candidateProfile',
              attributes: ['id','profileImageUrl'],
            },
          ],
        },
        {
          model: db.Message,
          as: 'messages',
          include: [
            {
              model: db.User,
              as: 'sender',
              attributes: ['id','name','email'],
              include: [
                {
                  model: db.Candidate,
                  as: 'candidateProfile',
                  attributes: ['id','profileImageUrl'],
                },
              ],
            },
          ],
          order: [['createdAt','ASC']],
        },
      ],
    });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Non-admin users must be participants in the conversation
    if (userRole !== 'admin' && !conversation.participants.some(p => p.id === userId)) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

// Post a message to a conversation
exports.postMessage = async (req, res, next) => {
  try {
    const { id } = req.params; // conversation id
    const userId = req.user?.id;
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Message body required' });

    const conversation = await db.Conversation.findByPk(id, { include: [{ model: db.User, as: 'participants' }] });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conversation.participants.some(p => p.id === userId)) return res.status(403).json({ success: false, message: 'Not a participant' });

    const msg = await db.Message.create({ conversationId: conversation.id, senderId: userId, body });
    // update conversation timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const result = await db.Message.findByPk(msg.id, {
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['id','name','email'],
          include: [
            {
              model: db.Candidate,
              as: 'candidateProfile',
              attributes: ['id','profileImageUrl'],
            },
          ],
        },
      ],
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Mark all messages in a conversation as read for the current user
exports.markConversationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await db.Conversation.findByPk(id, {
      include: [{ model: db.User, as: 'participants', attributes: ['id'] }],
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.id === userId)) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const [updatedCount] = await db.Message.update(
      { isRead: true },
      {
        where: {
          conversationId: conversation.id,
          senderId: { [Op.ne]: userId },
          isRead: false,
        },
      }
    );

    return res.json({ success: true, data: { updated: updatedCount } });
  } catch (err) {
    next(err);
  }
};

// Delete a conversation (only for participants)
exports.deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await db.Conversation.findByPk(id, {
      include: [{ model: db.User, as: 'participants', attributes: ['id'] }],
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.id === userId)) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    await conversation.destroy();

    return res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
};
