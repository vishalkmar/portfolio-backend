const express = require('express');
const SkillCategory = require('../models/SkillCategory');
const { protect } = require('../middleware/auth');
const { uploadImage, deleteCloudImage } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await SkillCategory.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const item = await SkillCategory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const item = await SkillCategory.findByIdAndUpdate(req.params.id, req.body, {
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
    const item = await SkillCategory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    for (const sk of item.skills) {
      if (sk.imagePublicId) await deleteCloudImage(sk.imagePublicId);
    }
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/skills', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    const cat = await SkillCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const skill = {
      name: req.body.name,
      icon: req.body.icon || '',
      level: Number(req.body.level) || 80,
    };
    if (req.file) {
      skill.image = req.file.path;
      skill.imagePublicId = req.file.filename;
    }
    cat.skills.push(skill);
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/skills/:skillId', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    const cat = await SkillCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const skill = cat.skills.id(req.params.skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (req.body.name !== undefined) skill.name = req.body.name;
    if (req.body.icon !== undefined) skill.icon = req.body.icon;
    if (req.body.level !== undefined) skill.level = Number(req.body.level);
    if (req.file) {
      if (skill.imagePublicId) await deleteCloudImage(skill.imagePublicId);
      skill.image = req.file.path;
      skill.imagePublicId = req.file.filename;
    }
    await cat.save();
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/skills/:skillId', protect, async (req, res, next) => {
  try {
    const cat = await SkillCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const skill = cat.skills.id(req.params.skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.imagePublicId) await deleteCloudImage(skill.imagePublicId);
    skill.deleteOne();
    await cat.save();
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
