const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const ConsultationRequest = require('../models/ConsultationRequest');
const { protect } = require('../middleware/auth');

// Get messages for a consultation
router.get('/:consultationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      consultation: req.params.consultationId
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

// Send message
router.post('/:consultationId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const { consultationId } = req.params;

    const consultation = await ConsultationRequest.findById(consultationId);

    if (!consultation || consultation.status !== 'accepted') {
      return res.status(400).json({
        message: 'Chat not available for this consultation'
      });
    }

    const message = await Message.create({
      consultation: consultationId,
      sender: req.user._id,
      senderRole: req.userRole,
      senderName: req.user.name,
      content
    });

    // ✅ FIXED: Emit to ALL users in room (including sender)
    const io = req.app.get('io');
    if (io) {
      console.log("📤 Emitting message to:", `chat_${consultationId}`);
      io.in(`chat_${consultationId}`).emit('new_message', message);
    }

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({
      message: 'Error sending message',
      error: error.message
    });
  }
});

module.exports = router;
