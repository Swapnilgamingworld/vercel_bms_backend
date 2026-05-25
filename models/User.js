const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'STUDENT'], required: true },
  rollNumber: { type: String, trim: true }, // For students
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
