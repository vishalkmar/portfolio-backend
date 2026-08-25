/**
 * One-shot seed that syncs the portfolio database with the CV
 * (Vishal Kumar - single page resume).
 *
 * Run from the backend root:  node scripts/seedFromResume.js
 *
 * - Skills   : replaces the old (empty) categories with the 7 CV groups
 * - Projects : upserts every CV project by title, with its OWN tech stack
 * - Services : seeds the services section (it was empty)
 * - Personal : refreshes headline / summary / contact details
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const SkillCategory = require('../models/SkillCategory');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Personal = require('../models/Personal');

/* ------------------------------------------------------------------ */
/* 1. SKILLS - exactly the groups printed on the CV                     */
/* ------------------------------------------------------------------ */
const SKILL_CATEGORIES = [
  {
    title: 'Languages',
    color: 'from-blue-500 to-cyan-500',
    order: 0,
    skills: [
      { name: 'JavaScript (ES6+)', icon: '\u{1F7E8}', level: 95 },
      { name: 'TypeScript', icon: '\u{1F537}', level: 88 },
      { name: 'Python', icon: '\u{1F40D}', level: 82 },
      { name: 'Java', icon: '\u{2615}', level: 75 },
      { name: 'C++', icon: '\u{2795}', level: 72 },
      { name: 'C', icon: '\u{1F4C4}', level: 70 },
      { name: 'SQL', icon: '\u{1F5C4}\u{FE0F}', level: 90 },
      { name: 'HTML5', icon: '\u{1F310}', level: 96 },
      { name: 'CSS3', icon: '\u{1F3A8}', level: 94 },
    ],
  },
  {
    title: 'Frontend',
    color: 'from-teal-500 to-cyan-500',
    order: 1,
    skills: [
      { name: 'React.js', icon: '\u{269B}\u{FE0F}', level: 95 },
      { name: 'Next.js', icon: '\u{25B2}', level: 90 },
      { name: 'Angular', icon: '\u{1F170}\u{FE0F}', level: 78 },
      { name: 'Redux', icon: '\u{1F9F0}', level: 85 },
      { name: 'React Native', icon: '\u{1F4F1}', level: 85 },
      { name: 'Tailwind CSS', icon: '\u{1F32C}\u{FE0F}', level: 94 },
      { name: 'Bootstrap', icon: '\u{1F171}\u{FE0F}', level: 88 },
      { name: 'PWA', icon: '\u{26A1}', level: 86 },
      { name: 'Responsive UI', icon: '\u{1F4D0}', level: 95 },
    ],
  },
  {
    title: 'Backend',
    color: 'from-green-500 to-emerald-500',
    order: 2,
    skills: [
      { name: 'Node.js', icon: '\u{1F7E9}', level: 94 },
      { name: 'Express.js', icon: '\u{1F686}', level: 93 },
      { name: 'Django', icon: '\u{1F3AF}', level: 72 },
      { name: 'REST API Design', icon: '\u{1F50C}', level: 93 },
      { name: 'JWT', icon: '\u{1F511}', level: 92 },
      { name: 'RBAC', icon: '\u{1F6C2}', level: 90 },
      { name: 'OAuth', icon: '\u{1FAAA}', level: 85 },
      { name: 'WebSockets', icon: '\u{1F504}', level: 84 },
      { name: 'Microservices', icon: '\u{1F9E9}', level: 80 },
    ],
  },
  {
    title: 'Databases',
    color: 'from-purple-500 to-violet-500',
    order: 3,
    skills: [
      { name: 'MongoDB', icon: '\u{1F343}', level: 93 },
      { name: 'MySQL', icon: '\u{1F42C}', level: 91 },
      { name: 'PostgreSQL', icon: '\u{1F418}', level: 90 },
      { name: 'Sequelize', icon: '\u{1F517}', level: 84 },
      { name: 'Mongoose', icon: '\u{1F9AB}', level: 92 },
      { name: 'Redis', icon: '\u{1F9E0}', level: 82 },
      { name: 'Schema Design', icon: '\u{1F4CA}', level: 88 },
      { name: 'Indexing', icon: '\u{1F4C7}', level: 86 },
      { name: 'Query Optimization', icon: '\u{1F680}', level: 88 },
    ],
  },
  {
    title: 'AI & Cloud',
    color: 'from-orange-500 to-red-500',
    order: 4,
    skills: [
      { name: 'Generative AI', icon: '\u{2728}', level: 88 },
      { name: 'RAG', icon: '\u{1F4DA}', level: 88 },
      { name: 'LangChain', icon: '\u{26D3}\u{FE0F}', level: 84 },
      { name: 'Vector Databases', icon: '\u{1F9EC}', level: 82 },
      { name: 'LLM Integration', icon: '\u{1F916}', level: 90 },
      { name: 'AWS', icon: '\u{2601}\u{FE0F}', level: 82 },
      { name: 'Docker', icon: '\u{1F433}', level: 85 },
      { name: 'Nginx', icon: '\u{1F300}', level: 84 },
      { name: 'Linux', icon: '\u{1F427}', level: 86 },
      { name: 'cPanel', icon: '\u{1F5A5}\u{FE0F}', level: 88 },
      { name: 'Git', icon: '\u{1F33F}', level: 93 },
      { name: 'CI/CD', icon: '\u{267E}\u{FE0F}', level: 84 },
    ],
  },
  {
    title: 'Security',
    color: 'from-pink-500 to-rose-500',
    order: 5,
    skills: [
      { name: 'OWASP Top 10', icon: '\u{1F6E1}\u{FE0F}', level: 88 },
      { name: 'Burp Suite', icon: '\u{1F575}\u{FE0F}', level: 85 },
      { name: 'SQL Injection Remediation', icon: '\u{1F489}', level: 87 },
      { name: 'IDOR Remediation', icon: '\u{1F6AA}', level: 86 },
      { name: 'Broken Access Control', icon: '\u{1F512}', level: 87 },
      { name: 'Cloudflare WAF', icon: '\u{1F9F1}', level: 85 },
      { name: 'Payment Fraud Detection', icon: '\u{1F6A8}', level: 83 },
    ],
  },
  {
    title: 'Integrations',
    color: 'from-indigo-500 to-blue-500',
    order: 6,
    skills: [
      { name: 'Razorpay', icon: '\u{1F4B3}', level: 93 },
      { name: 'Stripe', icon: '\u{1F4A0}', level: 88 },
      { name: 'PayPal', icon: '\u{1F17F}\u{FE0F}', level: 86 },
      { name: 'Cashfree', icon: '\u{1F4B0}', level: 92 },
      { name: 'Google Maps & Places', icon: '\u{1F5FA}\u{FE0F}', level: 90 },
      { name: 'Amadeus', icon: '\u{2708}\u{FE0F}', level: 84 },
      { name: 'Sabre', icon: '\u{1F6EB}', level: 82 },
      { name: 'TourVisio', icon: '\u{1F3DD}\u{FE0F}', level: 86 },
      { name: 'Booking.com', icon: '\u{1F3E8}', level: 84 },
      { name: 'Firebase', icon: '\u{1F525}', level: 88 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 2. PROJECTS - every project gets its OWN separated tech stack        */
/* ------------------------------------------------------------------ */
const PROJECTS = [
  {
    title: 'Reconnct - Experiences Marketplace',
    description:
      'Experiences marketplace with 7 role-based dashboards running on a single Node.js/Express + MySQL backend that serves a React web app, an internal team portal and a React Native Android app. Includes a slot-based experience builder, Cashfree checkout, PDF vouchers, real-time chat and Firebase push. Audited with Burp Suite and hardened against SQL injection, IDOR, broken access control and unauthenticated open routes, plus a custom payment fraud detection system and Cloudflare WAF/DNS protection.',
    technologies: [
      'React.js', 'React Native', 'Node.js', 'Express.js', 'MySQL', 'Sequelize',
      'JWT', 'RBAC', 'Cashfree', 'Firebase Push', 'Socket.IO', 'Cloudflare WAF',
      'Burp Suite', 'PDF Vouchers', 'Microsoft Clarity',
    ],
    category: 'fullstack',
    liveUrl: 'https://reconnct.com',
    githubUrl: '',
    order: 0,
  },
  {
    title: 'CypherMind (HACKER-AI) - Autonomous AI Penetration Testing Platform',
    description:
      'Autonomous security agent that turns plain-language goals into real tool runs (nmap, sqlmap, nuclei, Metasploit) inside a Kali Docker sandbox. React + Electron desktop client on a Node.js core with multi-provider LLM failover, RAG over 300+ security tools and CVSS-enriched reporting.',
    technologies: [
      'React.js', 'Electron', 'Node.js', 'Docker', 'Kali Sandbox', 'RAG',
      'Vector Database', 'LangChain', 'LLM Failover', 'nmap',
      'sqlmap', 'nuclei', 'Metasploit', 'CVSS Reporting',
    ],
    category: 'ai',
    liveUrl: 'https://hacker-agent-frontend.vercel.app',
    githubUrl: '',
    order: 1,
  },
  {
    title: 'Shri Yamuna Infra - Real Estate Community & CRM Platform',
    description:
      'Resident services platform (food, housekeeping, healthcare, transport, SOS) paired with an agent CRM fed by a WhatsApp lead pipeline that routes incoming enquiries straight to the assigned agent. An AI calling agent phones clients, captures requirements, proposes matching properties, answers queries and auto-categorises every lead back into the CRM pipeline. Ships with a RAG-powered AI concierge and a React Native app.',
    technologies: [
      'React.js', 'React Native', 'Node.js', 'Express.js', 'MongoDB', 'RAG',
      'Vector Database', 'WhatsApp Cloud API', 'AI Calling Agent', 'CRM Pipeline',
      'JWT', 'Tailwind CSS',
    ],
    category: 'fullstack',
    liveUrl: 'https://yamunainfra.com',
    githubUrl: '',
    order: 2,
  },
  {
    title: 'EGS Global - Smart Documentation, Apostille & Visa Platform',
    description:
      'Documentation and visa services platform covering MEA and HRD attestation, PCC legalisation and apostille, certified translation, visa and embassy/consular services, plus travel insurance, dummy tickets and meet-and-greet and accommodation assistance. Built around a multi-level service catalogue with nested navigation, an authenticated customer portal, an enquiry-to-order workflow and document verification tracking.',
    technologies: [
      'React.js', 'Next.js', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB',
      'Tailwind CSS', 'JWT', 'Cloudinary', 'Razorpay', 'Nodemailer', 'Multer',
      'Socket.IO',
    ],
    category: 'fullstack',
    liveUrl: 'https://egsglobalnew.vercel.app',
    githubUrl: '',
    order: 3,
  },
  {
    title: 'Abhyas Shala - Mock Test & Exam Preparation Platform',
    description:
      'Mock test and exam preparation platform for UPSC, BPSC, SSC CGL, IBPS PO and RRB NTPC. React 19 + Vite timed test engine with bilingual (Hindi/English) rendering, a Node.js + PostgreSQL backend with JWT auth, Cashfree subscriptions, invoice PDFs and live ranking. Published on Google Play as a TWA and installable as a PWA.',
    technologies: [
      'React 19', 'Vite', 'Node.js', 'Express.js', 'PostgreSQL', 'JWT', 'Bcrypt',
      'Cashfree Subscriptions', 'Invoice PDF', 'Live Ranking', 'PWA / TWA', 'Nginx',
    ],
    category: 'fullstack',
    liveUrl: 'https://abhyasshala.com/',
    githubUrl: '',
    order: 4,
  },
  {
    title: 'Holiday Seychelles - Island Travel Booking Platform',
    description:
      'MakeMyTrip-style booking engine for hotels, transfers and excursions, integrated with the TourVisio supplier API for real-time inventory, availability and pricing. Covers search and checkout flows, transaction management with payment reconciliation, voucher generation and a user dashboard for bookings and trip history.',
    technologies: [
      'React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Prisma ORM',
      'TourVisio API', 'Tailwind CSS', 'JWT', 'Payment Reconciliation',
      'Voucher Generation',
    ],
    category: 'fullstack',
    liveUrl: 'https://holidays-seychelles.com/',
    githubUrl: '',
    order: 5,
  },
  {
    title: 'Traveon.in - Tour & MICE Travel Platform',
    description:
      'Complete Tour & MICE (Meetings, Incentives, Conferences, Exhibitions) travel platform with a booking engine, package management, a custom travel CRM holding 20,000+ customer records with lead management and automated email workflows, and a secure payment gateway. Separate customer and admin panels with full backend support for tours, bookings and customer relationships.',
    technologies: [
      'React.js', 'Node.js', 'Express.js', 'MySQL', 'Prisma ORM', 'Tailwind CSS',
      'JWT', 'Razorpay', 'Amadeus', 'Sabre', 'Booking Engine', 'Travel CRM',
    ],
    category: 'fullstack',
    liveUrl: 'https://www.traveon.in/',
    githubUrl: '',
    order: 6,
  },
  {
    title: 'ICCICT 2026 - International Research Conference Platform',
    description:
      'Conference platform for the International Conference on Computational Intelligence and Computing Technologies & AI 2026, with paper submission, peer review management, delegate registration and conference updates across separate admin and user panels. Led IT operations for the 3-day event with 200+ attendees and zero technical complaints.',
    technologies: [
      'HTML5', 'CSS3', 'Bootstrap 5', 'JavaScript', 'jQuery', 'AJAX',
      'Paper Submission System', 'Admin Panel', 'Payment Gateway', 'Responsive Design',
    ],
    category: 'fullstack',
    liveUrl: 'https://iccict.org/',
    githubUrl: '',
    order: 7,
  },
  {
    title: 'NTMS - Fashion E-Commerce Platform',
    description:
      'Full-stack fashion e-commerce platform with a product catalogue, cart and checkout, Razorpay payments, dual authentication, role-based dashboards for customers and admins, and fully validated REST APIs.',
    technologies: [
      'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Razorpay',
      'JWT', 'RBAC', 'REST APIs', 'Cart & Checkout',
    ],
    category: 'fullstack',
    liveUrl: 'https://ntms.in',
    githubUrl: '',
    order: 8,
  },
  {
    title: 'MCTI Computer - Institute & Online Examination Platform',
    description:
      'Computer and coaching institute platform with a course catalogue, live online exams and tests, auto-evaluated results, marksheet generation and integrated online payments.',
    technologies: [
      'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Online Exam Engine',
      'Auto Evaluation', 'Marksheet Generation', 'Payment Gateway', 'JWT',
    ],
    category: 'fullstack',
    liveUrl: 'https://mcticomputer.in',
    githubUrl: '',
    order: 9,
  },
  {
    title: 'Devshay Healthcare - Pharmacy & Healthcare E-Commerce',
    description:
      'Pharmacy and healthcare e-commerce platform with a medicine catalogue, prescription-aware ordering, cart and checkout, order tracking and an admin dashboard for inventory and orders.',
    technologies: [
      'React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JWT',
      'Payment Gateway', 'Order Tracking', 'Admin Dashboard',
    ],
    category: 'fullstack',
    liveUrl: 'https://devshayhealthcare.com',
    githubUrl: '',
    order: 10,
  },
  {
    title: 'CollabCircle - AC Service Booking & Technician Dispatch',
    description:
      'Air-conditioner service booking and technician dispatch platform: customers book slots, jobs are auto-assigned to the nearest available technician, and both sides track job status through to completion and payment.',
    technologies: [
      'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Slot Booking',
      'Technician Dispatch', 'Google Maps API', 'JWT', 'Payment Gateway',
    ],
    category: 'fullstack',
    liveUrl: 'https://collabcircle.com',
    githubUrl: '',
    order: 11,
  },
  {
    title: 'Nexa Tech Innovation - Software Solutions Website',
    description:
      'Modern, high-performance business website for Nexa Software Solutions showcasing services, portfolio and company expertise, with smooth scroll-driven animations, interactive components and a fully responsive, performance-optimised build.',
    technologies: [
      'React.js', 'Tailwind CSS', 'Framer Motion', 'GSAP', 'ShadCN UI',
      'Chakra UI', 'React Router', 'React Hook Form', 'Zod', 'EmailJS',
    ],
    category: 'frontend',
    liveUrl: 'https://nexatechinnovation.in/',
    githubUrl: '',
    order: 12,
  },
];

/* ------------------------------------------------------------------ */
/* 3. SERVICES - the section was empty                                  */
/* ------------------------------------------------------------------ */
const SERVICES = [
  {
    title: 'Full Stack Web Development',
    description:
      'End-to-end production web apps on the MERN stack and Next.js - from schema design and REST APIs to a polished, responsive UI shipped and hosted.',
    icon: 'Code',
    color: 'from-blue-500 to-cyan-500',
    features: ['React.js & Next.js', 'Node.js & Express.js', 'MongoDB / MySQL / PostgreSQL', 'Role-based dashboards'],
    order: 0,
  },
  {
    title: 'Generative AI & RAG Solutions',
    description:
      'LLM features that actually ship: retrieval-augmented chat over your own documents, autonomous AI agents, and multi-provider failover so nothing goes down.',
    icon: 'Zap',
    color: 'from-orange-500 to-red-500',
    features: ['RAG pipelines & vector DBs', 'LangChain agents', 'AI concierge & calling agents', 'Multi-provider LLM failover'],
    order: 1,
  },
  {
    title: 'Mobile & PWA Development',
    description:
      'One codebase, every screen - React Native Android apps, installable PWAs and Google Play TWA releases backed by the same API.',
    icon: 'Smartphone',
    color: 'from-green-500 to-emerald-500',
    features: ['React Native (Android)', 'Progressive Web Apps', 'Google Play TWA release', 'Firebase push notifications'],
    order: 2,
  },
  {
    title: 'API Development & Integrations',
    description:
      'Clean, validated REST APIs plus the third-party plumbing that makes a product real - payments, travel inventory, maps and messaging.',
    icon: 'Server',
    color: 'from-purple-500 to-violet-500',
    features: ['REST API design & docs', 'Razorpay / Stripe / PayPal / Cashfree', 'Amadeus, Sabre, TourVisio', 'Google Maps & WhatsApp API'],
    order: 3,
  },
  {
    title: 'Database Design & Optimisation',
    description:
      'Schemas that scale and queries that stay fast - indexing, query rewriting and Redis caching to cut response times and database load.',
    icon: 'Database',
    color: 'from-teal-500 to-cyan-500',
    features: ['Schema & index design', '500ms to 100ms query tuning', 'Redis caching layers', 'Mongoose, Sequelize & Prisma'],
    order: 4,
  },
  {
    title: 'Application Security Hardening',
    description:
      'Real penetration testing on your own stack: OWASP Top 10 audits with Burp Suite, then the remediation work and the WAF that sits in front of it.',
    icon: 'Shield',
    color: 'from-pink-500 to-rose-500',
    features: ['OWASP Top 10 audit', 'SQLi, IDOR & access-control fixes', 'Payment fraud detection', 'Cloudflare WAF & DNS'],
    order: 5,
  },
  {
    title: 'DevOps, Cloud & Deployment',
    description:
      'Getting it live and keeping it live - Docker, Nginx, AWS and cPanel/DNS administration with CI/CD pipelines and 99.9% uptime.',
    icon: 'Cloud',
    color: 'from-indigo-500 to-blue-500',
    features: ['Docker & Nginx', 'AWS & Linux server setup', 'cPanel, DNS & SSL', 'CI/CD pipelines'],
    order: 6,
  },
  {
    title: 'Custom CRM & Booking Engines',
    description:
      'Lead pipelines, booking flows and back-office tooling built around how your business actually runs - not a template you have to bend into shape.',
    icon: 'Users',
    color: 'from-yellow-500 to-amber-500',
    features: ['Lead & pipeline management', 'Slot / inventory booking engines', 'Automated email workflows', 'Payment reconciliation & vouchers'],
    order: 7,
  },
];

/* ------------------------------------------------------------------ */
/* 4. PERSONAL - headline + summary straight from the CV                */
/* ------------------------------------------------------------------ */
const PERSONAL = {
  name: 'Vishal Kumar',
  email: 'vk722413@gmail.com',
  phone: '+91 9540792427',
  address: 'Shahdara, North East Delhi - 110053, India',
  position: 'Full Stack Developer',
  positions: [
    'Full Stack Developer',
    'MERN & Next.js Developer',
    'Generative AI, RAG & LangChain',
    'AWS, Docker & CI/CD',
  ],
  summary:
    'Full Stack Developer with 1.5+ years of experience shipping production-grade web and mobile applications using React.js, Next.js, Node.js, Express.js, MongoDB, MySQL and PostgreSQL. Built and deployed 10+ live platforms spanning marketplaces, booking engines, CRM, e-learning, healthcare and AI products - with role-based dashboards, RAG/LLM integrations, payment gateways and application security hardening, serving 50,000+ monthly users.',
  socialLinks: {
    github: 'https://github.com/vishalkmar',
    linkedin: 'https://linkedin.com/in/vishal-kumar-839490327',
  },
};

/* ------------------------------------------------------------------ */

const run = async () => {
  await connectDB();

  // ---- Skills -------------------------------------------------------
  const beforeSkills = await SkillCategory.countDocuments();
  await SkillCategory.deleteMany({});
  await SkillCategory.insertMany(SKILL_CATEGORIES);
  const totalSkills = SKILL_CATEGORIES.reduce((n, c) => n + c.skills.length, 0);
  console.log(
    `Skills   : removed ${beforeSkills} old (empty) categories -> inserted ${SKILL_CATEGORIES.length} categories / ${totalSkills} skills`
  );

  // ---- Projects (upsert by title, keeps existing Cloudinary images) --
  let created = 0;
  let updated = 0;
  for (const p of PROJECTS) {
    const existing = await Project.findOne({ title: p.title });
    if (existing) {
      Object.assign(existing, p);
      await existing.save();
      updated += 1;
    } else {
      await Project.create(p);
      created += 1;
    }
  }
  // anything not on the CV keeps living, it just moves to the end
  await Project.updateMany(
    { title: { $nin: PROJECTS.map((p) => p.title) } },
    { $set: { order: 99 } }
  );
  // source code is never exposed on the public site
  await Project.updateMany({}, { $set: { githubUrl: '' } });
  const projectCount = await Project.countDocuments();
  console.log(
    `Projects : ${created} created, ${updated} updated (${projectCount} total), each with its own separated tech stack`
  );

  // ---- Services -----------------------------------------------------
  const beforeServices = await Service.countDocuments();
  await Service.deleteMany({});
  await Service.insertMany(SERVICES);
  console.log(`Services : removed ${beforeServices} -> inserted ${SERVICES.length}`);

  // ---- Personal -----------------------------------------------------
  let personal = await Personal.findOne();
  if (!personal) personal = await Personal.create({});
  const existingLinks = personal.socialLinks?.toObject?.() || personal.socialLinks || {};
  Object.assign(personal, PERSONAL);
  personal.socialLinks = { ...existingLinks, ...PERSONAL.socialLinks };
  await personal.save();
  console.log('Personal : headline, summary and contact details synced with the CV');

  await mongoose.disconnect();
  console.log('\nDone.');
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
