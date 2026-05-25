const express = require('express');
const Mark = require('../models/Mark');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const marks = await Mark.find().sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load marks' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { studentId, subject, marksObtained, maxMarks, semester } = req.body;
  try {
    const mark = await Mark.create({
      studentId,
      subject,
      marksObtained,
      maxMarks,
      semester,
    });
    res.status(201).json(mark);
  } catch (error) {
    res.status(500).json({ message: 'Unable to add marks' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { studentId, subject, marksObtained, maxMarks, semester } = req.body;
  try {
    const mark = await Mark.findByIdAndUpdate(
      id,
      { studentId, subject, marksObtained, maxMarks, semester },
      { new: true, runValidators: true },
    );
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }
    res.json(mark);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update marks' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const mark = await Mark.findByIdAndDelete(req.params.id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark record not found' });
    }
    res.json({ message: 'Mark record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete mark record' });
  }
});

module.exports = router;
