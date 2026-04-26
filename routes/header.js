const express = require('express');
const Header = require('../models/Header');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getOrCreate = async () => {
  let doc = await Header.findOne();
  if (!doc) {
    doc = await Header.create({
      brand: 'Vishal Kumar',
      navItems: [
        { id: 'home', label: 'Home' },
        { id: 'education', label: 'Education' },
        { id: 'projects', label: 'Projects' },
        { id: 'skills', label: 'Skills' },
        { id: 'services', label: 'Services' },
        { id: 'contact', label: 'Contact' },
      ],
    });
  }
  return doc;
};

router.get('/', async (req, res, next) => {
  try {
    res.json(await getOrCreate());
  } catch (err) {
    next(err);
  }
});

router.put('/', protect, async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    if (req.body.brand !== undefined) doc.brand = req.body.brand;
    if (Array.isArray(req.body.navItems)) doc.navItems = req.body.navItems;
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
