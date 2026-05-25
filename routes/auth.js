const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'verysecretkey';

router.post('/register', async (req, res, next) => {
  const { fullName, email, password, role, rollNumber } = req.body;
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Students can register directly; Teachers/Admins require authentication
    if (role === 'STUDENT') {
      return next();
    }

    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount === 0) {
      if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'First user must be an ADMIN' });
      }
      req.firstAdmin = true;
      return next();
    }

    return verifyToken(req, res, (err) => {
      if (err) return;
      return requireAdmin(req, res, next);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user' });
  }
}, async (req, res) => {
  const { fullName, email, password, role, rollNumber } = req.body;
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      rollNumber: role === 'STUDENT' ? rollNumber : undefined,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        rollNumber: newUser.rollNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
      },
      jwtSecret,
      {
        expiresIn: '7d',
      }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in' });
  }
});

module.exports = router;
