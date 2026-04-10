const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { protect, requireRole } = require('../middleware/auth');

// Get current patient profile
router.get('/me', protect, requireRole('patient'), async (req, res) => {
  res.json(req.user);
});

// Update patient profile
router.put('/me', protect, requireRole('patient'), async (req, res) => {
  try {
    const { name, age, occupation } = req.body;
    const updated = await Patient.findByIdAndUpdate(
      req.user._id,
      { name, age, occupation },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

module.exports = router;
