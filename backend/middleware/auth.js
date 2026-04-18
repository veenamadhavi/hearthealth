const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token =
        req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message:
          'Not authorized, no token',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        'secret'
    );

    let user;

    if (
      decoded.role
        .toLowerCase()
        .trim() === 'patient'
    ) {
      user =
        await Patient.findById(
          decoded.id
        );
    } else if (
      decoded.role
        .toLowerCase()
        .trim() === 'doctor'
    ) {
      user =
        await Doctor.findById(
          decoded.id
        );
    }

    if (!user) {
      return res.status(401).json({
        message:
          'User not found',
      });
    }

    req.user = user;
    req.userRole =
      decoded.role
        .toLowerCase()
        .trim();

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        'Not authorized, token failed',
    });
  }
};

const requireRole =
  (role) =>
  (req, res, next) => {
    if (
      req.userRole !==
      role
        .toLowerCase()
        .trim()
    ) {
      return res.status(403).json({
        message: `Access denied. ${role} only.`,
      });
    }

    next();
  };

const generateToken = (
  id,
  role
) => {
  return jwt.sign(
    {
      id,
      role:
        role
          .toLowerCase()
          .trim(),
    },
    process.env.JWT_SECRET ||
      'secret',
    {
      expiresIn: '7d',
    }
  );
};

module.exports = {
  protect,
  requireRole,
  generateToken,
};