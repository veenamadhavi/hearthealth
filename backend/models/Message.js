const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultationRequest', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderRole: { type: String, enum: ['patient', 'doctor'], required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
