const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

// Get all doctors list
router.get('/', protect, async (req, res) => {
  try {
    const { specialization } = req.query;
    const filter = {};
    if (specialization) filter.specialization = specialization;
    const doctors = await Doctor.find(filter).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get doctor profile
router.get('/me', protect, async (req, res) => {
  if (req.userRole !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
  res.json(req.user);
});

// Get single doctor
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor', error: error.message });
  }
});

module.exports = router;
