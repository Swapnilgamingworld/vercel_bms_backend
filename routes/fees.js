const express = require('express');
const Fee = require('../models/Fee');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const fees = await Fee.find().sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load fee records' });
  }
});

router.get('/:studentId', verifyToken, async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    if (!fees.length) {
      return res.status(404).json({ message: 'Fee records not found for this student' });
    }
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load fee details' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { studentId, totalAmount, paidAmount, paymentStatus, paymentDates } = req.body;
  try {
    const dueAmount = Number(totalAmount) - Number(paidAmount);
    const fee = await Fee.create({
      studentId,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentDates: paymentDates || [],
    });
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create fee record' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { totalAmount, paidAmount, paymentStatus, paymentDates } = req.body;
  try {
    const existing = await Fee.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (req.user.role !== 'ADMIN') {
      existing.paidAmount = paidAmount ?? existing.paidAmount;
      existing.dueAmount = Number(existing.totalAmount) - Number(existing.paidAmount);
      existing.paymentStatus = paymentStatus || existing.paymentStatus;
      if (paymentDates) {
        existing.paymentDates = paymentDates;
      }
      await existing.save();
      return res.json(existing);
    }

    const dueAmount = Number(totalAmount) - Number(paidAmount);
    const updated = await Fee.findByIdAndUpdate(
      id,
      { totalAmount, paidAmount, dueAmount, paymentStatus, paymentDates: paymentDates || existing.paymentDates },
      { new: true, runValidators: true },
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update fee record' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete fee record' });
  }
});

module.exports = router;
