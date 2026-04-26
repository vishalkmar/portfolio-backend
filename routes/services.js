const express = require('express');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

const parseFeatures = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p;
    } catch (_) {}
    return val.split('\n').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

router.get('/', async (req, res, next) => {
  try {
    const items = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.features !== undefined) data.features = parseFeatures(data.features);
    const item = await Service.create(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.features !== undefined) data.features = parseFeatures(data.features);
    const item = await Service.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
