const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const headerSchema = new mongoose.Schema(
  {
    brand: { type: String, default: 'Vishal Kumar' },
    navItems: { type: [navItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Header', headerSchema);
