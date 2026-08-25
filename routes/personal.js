const express = require('express');
const path = require('path');
const fs = require('fs');
const Personal = require('../models/Personal');
const { protect } = require('../middleware/auth');
const { uploadImage, deleteCloudImage } = require('../config/cloudinary');
const { uploadResume, resumeDir } = require('../middleware/resumeUpload');

const router = express.Router();

const getOrCreate = async () => {
  let doc = await Personal.findOne();
  if (!doc) doc = await Personal.create({});
  return doc;
};

router.get('/', async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.put('/', protect, async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    const body = { ...req.body };
    if (typeof body.positions === 'string') {
      try { body.positions = JSON.parse(body.positions); } catch (_) {}
    }
    if (typeof body.socialLinks === 'string') {
      try { body.socialLinks = JSON.parse(body.socialLinks); } catch (_) {}
    }
    Object.assign(doc, body);
    if (body.socialLinks && typeof body.socialLinks === 'object') {
      doc.socialLinks = { ...doc.socialLinks.toObject?.() || doc.socialLinks, ...body.socialLinks };
    }
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.post('/image', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    if (doc.imagePublicId) await deleteCloudImage(doc.imagePublicId);
    doc.image = req.file.path;
    doc.imagePublicId = req.file.filename;
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * Public CV download.
 *
 * The static /uploads mount serves the PDF inline, which makes the browser
 * preview it instead of saving it. This sends the same file with a
 * Content-Disposition attachment header and a clean filename.
 */
router.get('/resume/download', async (req, res, next) => {
  try {
    const doc = await Personal.findOne();
    if (!doc || !doc.resumeFilename) {
      return res.status(404).json({ message: 'No resume uploaded yet' });
    }
    const filePath = path.join(resumeDir, doc.resumeFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file is missing on the server' });
    }
    return res.download(filePath, 'Vishal-Kumar-Resume.pdf');
  } catch (err) {
    return next(err);
  }
});

router.post('/resume', protect, uploadResume.single('resume'), async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (doc.resumeFilename) {
      const oldPath = path.join(resumeDir, doc.resumeFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    doc.resumeFilename = req.file.filename;
    doc.resumeUrl = `/uploads/resume/${req.file.filename}`;
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.delete('/resume', protect, async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    if (doc.resumeFilename) {
      const oldPath = path.join(resumeDir, doc.resumeFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    doc.resumeFilename = '';
    doc.resumeUrl = '';
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
