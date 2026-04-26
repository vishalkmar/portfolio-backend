const express = require('express');
const Education = require('../models/Education');
const { protect } = require('../middleware/auth');
const { uploadImage, deleteCloudImage } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Education.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Education.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    const item = await Education.create(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    const item = await Education.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    if (req.file) {
      if (item.imagePublicId) await deleteCloudImage(item.imagePublicId);
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    Object.assign(item, data);
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Education.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.imagePublicId) await deleteCloudImage(item.imagePublicId);
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
