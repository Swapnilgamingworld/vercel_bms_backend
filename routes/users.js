const express = require('express');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/me', verifyToken, (req, res) => {
  const { _id, fullName, email, role, createdAt } = req.user;
  res.json({ id: _id, fullName, email, role, createdAt });
});

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load users' });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { fullName, email, role } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { fullName, email: email?.toLowerCase(), role },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update user' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete user' });
  }
});

module.exports = router;
