const mongoose = require('mongoose');

const paymentDateSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
});

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'DUE'], required: true },
  paymentDates: { type: [paymentDateSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Fee', feeSchema);
