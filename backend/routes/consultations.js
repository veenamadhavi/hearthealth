const express = require('express');
const router = express.Router();
const ConsultationRequest = require('../models/ConsultationRequest');
const HeartReport = require('../models/HeartReport');
const { protect, requireRole } = require('../middleware/auth');

// Patient creates consultation request
router.post('/', protect, requireRole('patient'), async (req, res) => {
  try {
    const { doctorId, heartReportId, patientMessage } = req.body;

    const consultation = await ConsultationRequest.create({
      patient: req.user._id,
      doctor: doctorId,
      heartReport: heartReportId || null,
      patientMessage: patientMessage || '',
      status: 'pending'
    });

    const populated = await ConsultationRequest.findById(consultation._id)
      .populate('patient', 'name email age')
      .populate('doctor', 'name specialization qualification')
      .populate('heartReport');

    // Emit to doctor via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`doctor_${doctorId}`).emit('new_consultation_request', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating consultation', error: error.message });
  }
});

// Get patient's consultations
router.get('/my', protect, requireRole('patient'), async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({ patient: req.user._id })
      .populate('doctor', 'name specialization qualification yearsOfExperience')
      .populate('heartReport')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
});

// Get doctor's pending requests
router.get('/pending', protect, requireRole('doctor'), async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({
      doctor: req.user._id,
      status: 'pending'
    })
      .populate('patient', 'name email age occupation')
      .populate('heartReport')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get all doctor's consultations
router.get('/doctor/all', protect, requireRole('doctor'), async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({ doctor: req.user._id })
      .populate('patient', 'name email age occupation')
      .populate('heartReport')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
});

// Doctor accepts or rejects
router.put('/:id/respond', protect, requireRole('doctor'), async (req, res) => {
  try {
    const { status, doctorNote } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const consultation = await ConsultationRequest.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status, doctorNote, updatedAt: Date.now() },
      { new: true }
    )
      .populate('patient', 'name email age')
      .populate('doctor', 'name specialization')
      .populate('heartReport');

    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    // Notify patient via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`patient_${consultation.patient._id}`).emit('consultation_response', consultation);
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Error responding to consultation', error: error.message });
  }
});

// Get single consultation
router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await ConsultationRequest.findById(req.params.id)
      .populate('patient', 'name email age occupation')
      .populate('doctor', 'name specialization qualification yearsOfExperience')
      .populate('heartReport');

    if (!consultation) return res.status(404).json({ message: 'Not found' });
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consultation', error: error.message });
  }
});

module.exports = router;
