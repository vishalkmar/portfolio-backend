const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  { name: { type: String, required: true }, href: { type: String, default: '#' } },
  { _id: false }
);

const footerSchema = new mongoose.Schema(
  {
    brand: { type: String, default: 'Vishal Kumar' },
    tagline: {
      type: String,
      default:
        'Full Stack Developer passionate about creating exceptional digital experiences.',
    },
    copyright: { type: String, default: 'All rights reserved.' },
    quickLinks: { type: [linkSchema], default: [] },
    serviceLinks: { type: [linkSchema], default: [] },
    bottomLinks: { type: [linkSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Footer', footerSchema);
