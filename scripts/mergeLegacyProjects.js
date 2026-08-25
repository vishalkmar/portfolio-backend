/**
 * The CV titles differ from the titles the projects were originally saved
 * under, so the seed created new documents instead of updating the old ones.
 *
 * This carries the Cloudinary cover image across from the legacy document to
 * its CV counterpart and then removes the duplicate.
 *
 * Run once:  node scripts/mergeLegacyProjects.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Project = require('../models/Project');

const MERGES = [
  ["Abhyas Shala - India's Trusted Exam Practice Platform", 'Abhyas Shala - Mock Test & Exam Preparation Platform'],
  ['Traveon.in', 'Traveon.in - Tour & MICE Travel Platform'],
  ['Holiday Seychlles', 'Holiday Seychelles - Island Travel Booking Platform'],
  ['Nexa Tech Innovation (Software solution Website)', 'Nexa Tech Innovation - Software Solutions Website'],
  [
    ' International Conference on Computational Intelligence and Computing Technologies & AI 2026',
    'ICCICT 2026 - International Research Conference Platform',
  ],
  ['EGS Group - Global Visa & Immigration Services Platform', 'EGS Global - Smart Documentation, Apostille & Visa Platform'],
];

const run = async () => {
  await connectDB();

  for (const [legacyTitle, cvTitle] of MERGES) {
    const legacy = await Project.findOne({ title: legacyTitle });
    const target = await Project.findOne({ title: cvTitle });

    if (!legacy) {
      console.log(`skip    : no legacy doc titled "${legacyTitle}"`);
      continue;
    }
    if (!target) {
      console.log(`skip    : no CV doc titled "${cvTitle}"`);
      continue;
    }

    if (legacy.image && !target.image) {
      target.image = legacy.image;
      target.imagePublicId = legacy.imagePublicId;
      await target.save();
    }
    // deleteOne on the model, not the doc, so the image is NOT removed from
    // Cloudinary - it now belongs to the CV document.
    await Project.deleteOne({ _id: legacy._id });
    console.log(`merged  : "${legacyTitle}" -> "${cvTitle}"${legacy.image ? ' (cover image carried over)' : ''}`);
  }

  const remaining = await Project.find().sort({ order: 1 }).select('title image liveUrl technologies');
  console.log(`\n${remaining.length} projects now live:\n`);
  remaining.forEach((p, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. ${p.title}\n    image: ${p.image ? 'yes' : 'NO COVER'} | live: ${p.liveUrl || '-'} | ${p.technologies.length} techs`
    );
  });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Merge failed:', err);
  process.exit(1);
});
