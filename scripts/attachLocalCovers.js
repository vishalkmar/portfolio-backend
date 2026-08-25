/**
 * Uploads the project cover images that already sit in the frontend repo
 * (portfilio/src/images) to Cloudinary and attaches them to the matching
 * project documents.
 *
 * Run once:  node scripts/attachLocalCovers.js
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { cloudinary } = require('../config/cloudinary');
const Project = require('../models/Project');

const IMAGE_DIR = path.join(__dirname, '..', '..', 'portfilio', 'src', 'images');

const COVERS = [
  ['MCTI Computer - Institute & Online Examination Platform', 'mcti.jpg'],
  ['CollabCircle - AC Service Booking & Technician Dispatch', 'collabcircle.jpg'],
];

const run = async () => {
  await connectDB();

  for (const [title, file] of COVERS) {
    const project = await Project.findOne({ title });
    if (!project) {
      console.log(`skip   : no project titled "${title}"`);
      continue;
    }
    if (project.image) {
      console.log(`skip   : "${title}" already has a cover`);
      continue;
    }

    const filePath = path.join(IMAGE_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`skip   : ${file} not found in ${IMAGE_DIR}`);
      continue;
    }

    const res = await cloudinary.uploader.upload(filePath, {
      folder: 'portfolio',
      transformation: [{ quality: 'auto:good' }],
    });
    project.image = res.secure_url;
    project.imagePublicId = res.public_id;
    await project.save();
    console.log(`upload : ${file} -> "${title}"`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Cover upload failed:', err);
  process.exit(1);
});
