const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    qualification: { type: String, default: '' },
    institution: { type: String, required: true },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    gradeType: {
      type: String,
      enum: ['CGPA', 'SGPA', 'Percentage', 'Marks', 'Pursuing'],
      default: 'Percentage',
    },
    gradeValue: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Education', educationSchema);
