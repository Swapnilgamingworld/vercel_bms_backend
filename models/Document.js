const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  documentType: {
    type: String,
    enum: ['BONAFIDE', 'TRANSFER_CERTIFICATE', 'MARKSHEET'],
    required: true,
  },
  issueDate: { type: Date, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', documentSchema);
