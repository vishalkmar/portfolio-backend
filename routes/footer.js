const express = require('express');
const Footer = require('../models/Footer');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getOrCreate = async () => {
  let doc = await Footer.findOne();
  if (!doc) {
    doc = await Footer.create({
      brand: 'Vishal Kumar',
      tagline:
        'Full Stack Developer passionate about creating exceptional digital experiences with cutting-edge technologies.',
      copyright: 'All rights reserved. Built with React and modern web technologies.',
      quickLinks: [
        { name: 'Home', href: '#home' },
        { name: 'Projects', href: '#projects' },
        { name: 'Services', href: '#services' },
        { name: 'Skills', href: '#skills' },
        { name: 'Contact', href: '#contact' },
      ],
      serviceLinks: [
        { name: 'Frontend Development', href: '#services' },
        { name: 'Backend Development', href: '#services' },
        { name: 'UI/UX Design', href: '#services' },
        { name: 'Consulting', href: '#services' },
      ],
      bottomLinks: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Sitemap', href: '#' },
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
    const fields = ['brand', 'tagline', 'copyright', 'quickLinks', 'serviceLinks', 'bottomLinks'];
    for (const f of fields) {
      if (req.body[f] !== undefined) doc[f] = req.body[f];
    }
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
