const express = require('express');
const Student = require('../models/Student');
const Document = require('../models/Document');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const feeStats = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalFeesCollected: { $sum: '$paidAmount' },
          totalFeesPending: { $sum: '$dueAmount' },
        },
      },
    ]);

    const averageMarksByDept = await Mark.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.department',
          average: { $avg: '$marksObtained' },
        },
      },
      {
        $project: {
          _id: 0,
          department: '$_id',
          average: { $round: ['$average', 2] },
        },
      },
    ]);

    const recentDocuments = await Document.find().sort({ createdAt: -1 }).limit(3).populate('studentId', 'name');
    const recentMarks = await Mark.find().sort({ createdAt: -1 }).limit(3).populate('studentId', 'name');
    const recentFees = await Fee.find().sort({ createdAt: -1 }).limit(3).populate('studentId', 'name');

    const recentActivities = [
      ...recentDocuments.map((doc) => `${doc.documentType} generated for ${doc.studentId?.name || 'student'}`),
      ...recentMarks.map((mark) => `${mark.subject} marks updated for ${mark.studentId?.name || 'student'}`),
      ...recentFees.map((fee) => `Fee status updated for ${fee.studentId?.name || 'student'}`),
    ].slice(0, 6);

    const pendingDocuments = await Document.countDocuments();

    res.json({
      totalStudents,
      totalFeesCollected: feeStats[0]?.totalFeesCollected || 0,
      totalFeesPending: feeStats[0]?.totalFeesPending || 0,
      pendingDocuments,
      averageMarksByDept,
      recentActivities,
      teacherAssignedStudentsCount: 0,
      pendingMarksEntries: 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load dashboard stats' });
  }
});

module.exports = router;
