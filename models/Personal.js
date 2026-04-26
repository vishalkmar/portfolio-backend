const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    position: { type: String, default: '' },
    positions: { type: [String], default: [] },
    summary: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumeFilename: { type: String, default: '' },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Personal', personalSchema);
