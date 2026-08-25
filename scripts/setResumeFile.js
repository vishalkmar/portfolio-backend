/**
 * Points the Personal document at the CV that actually sits in
 * uploads/resume. The old record referenced a file that no longer existed on
 * disk, which is why "Download CV" did nothing.
 *
 * Run:  node scripts/setResumeFile.js [filename]
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Personal = require('../models/Personal');
const { resumeDir } = require('../middleware/resumeUpload');

const filename = process.argv[2] || 'resume_vishal_kumar.pdf';

const run = async () => {
  const filePath = path.join(resumeDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`No such file: ${filePath}`);
    process.exit(1);
  }

  await connectDB();

  let doc = await Personal.findOne();
  if (!doc) doc = await Personal.create({});

  const previous = doc.resumeFilename;
  doc.resumeFilename = filename;
  doc.resumeUrl = `/uploads/resume/${filename}`;
  await doc.save();

  console.log(`resumeFilename : ${previous || '(none)'} -> ${filename}`);
  console.log(`resumeUrl      : ${doc.resumeUrl}`);
  console.log(`file size      : ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`);
  console.log('\nDownload endpoint: GET /api/personal/resume/download');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
