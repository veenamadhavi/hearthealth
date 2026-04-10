const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../middleware/auth');

// Patient Registration
router.post('/patient/register', async (req, res) => {
  try {
    const { name, email, password, age, occupation } = req.body;

    if (!name || !email || !password || !age || !occupation) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const patient = await Patient.create({ name, email, password, age, occupation });
    const token = generateToken(patient._id, 'patient');

    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      user: { ...patient.toJSON(), role: 'patient' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Doctor Registration
router.post('/doctor/register', async (req, res) => {
  try {
    const { name, email, password, qualification, yearsOfExperience, specialization } = req.body;

    if (!name || !email || !password || !qualification || !yearsOfExperience || !specialization) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const doctor = await Doctor.create({ name, email, password, qualification, yearsOfExperience, specialization });
    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({
      message: 'Doctor registered successfully',
      token,
      user: { ...doctor.toJSON(), role: 'doctor' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Patient Login
router.post('/patient/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient || !(await patient.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(patient._id, 'patient');
    res.json({ token, user: { ...patient.toJSON(), role: 'patient' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Doctor Login
router.post('/doctor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor || !(await doctor.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(doctor._id, 'doctor');
    res.json({ token, user: { ...doctor.toJSON(), role: 'doctor' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
