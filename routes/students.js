const express = require('express');
const Student = require('../models/Student');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load students' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load student' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { name, rollNumber, department, year, email, phone, address } = req.body;
  try {
    const existing = await Student.findOne({ rollNumber });
    if (existing) {
      return res.status(409).json({ message: 'Roll number already exists' });
    }
    const student = await Student.create({ name, rollNumber, department, year, email, phone, address });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Unable to add student' });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, rollNumber, department, year, email, phone, address } = req.body;
  try {
    const student = await Student.findByIdAndUpdate(
      id,
      { name, rollNumber, department, year, email, phone, address },
      { new: true, runValidators: true },
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update student' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete student' });
  }
});

module.exports = router;
