const express = require('express');
const Document = require('../models/Document');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('studentId', 'name rollNumber department')
      .populate('createdBy', 'fullName email');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load documents' });
  }
});

async function createDocument(req, res, documentType) {
  const { studentId, issueDate, content } = req.body;
  if (!studentId || !issueDate || !content) {
    return res.status(400).json({ message: 'studentId, issueDate, and content are required' });
  }
  try {
    const document = await Document.create({
      studentId,
      documentType,
      issueDate,
      content,
      createdBy: req.user._id,
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create document' });
  }
}

router.post('/bonafide', async (req, res) => createDocument(req, res, 'BONAFIDE'));
router.post('/transfer-certificate', async (req, res) => createDocument(req, res, 'TRANSFER_CERTIFICATE'));
router.post('/marksheet', async (req, res) => createDocument(req, res, 'MARKSHEET'));

async function getDocumentByType(req, res, documentType) {
  try {
    const document = await Document.findOne({ _id: req.params.id, documentType })
      .populate('studentId', 'name rollNumber department')
      .populate('createdBy', 'fullName email');
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load document' });
  }
}

router.get('/bonafide/:id', async (req, res) => getDocumentByType(req, res, 'BONAFIDE'));
router.get('/transfer-certificate/:id', async (req, res) => getDocumentByType(req, res, 'TRANSFER_CERTIFICATE'));
router.get('/marksheet/:id', async (req, res) => getDocumentByType(req, res, 'MARKSHEET'));

module.exports = router;
