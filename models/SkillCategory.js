const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    level: { type: Number, default: 80, min: 0, max: 100 },
  },
  { _id: true }
);

const skillCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    color: { type: String, default: 'from-blue-500 to-cyan-500' },
    order: { type: Number, default: 0 },
    skills: { type: [skillSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillCategory', skillCategorySchema);
