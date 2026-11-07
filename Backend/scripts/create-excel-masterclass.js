/**
 * 🆕 CREATE: "Excel 10X Productivity Masterclass"
 *
 * Creates (or refreshes, by slug) the Excel masterclass for
 * SUNDAY 27 SEP 2026, 11:30 AM – 2:30 PM IST.
 *
 * Price 0 = FREE badge on the landing page, which triggers the ₹9
 * convenience fee at checkout (see routes/paymentMasterclass.js) —
 * the same ₹9 seat-confirmation model as the Gen AI workshop.
 *
 * Public URL after creation: /masterclass/excel-masterclass
 *
 * Usage:  node scripts/create-excel-masterclass.js
 * Needs:  MONGO_URI in Backend/.env
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Masterclass = require('../models/Masterclass');

const SLUG = 'excel-masterclass';

// Sunday 27 Sep 2026, 11:30 AM IST (+05:30)
const START = new Date('2026-09-27T11:30:00+05:30');

const doc = {
  title: 'Excel 10X Productivity Masterclass',

  // pre('save') slug hook skips regeneration when slug is explicitly set;
  // the upsert below also bypasses 'save' hooks entirely, so the pinned
  // slug can never be overwritten.
  slug: SLUG,

  tagline:
    'A hands-on 3-hour live masterclass to make Excel actually work for you — ' +
    'formulas, pivot tables, dashboards and AI tricks that turn hours of ' +
    'spreadsheet struggle into minutes. No prior expertise needed.',

  bannerImage:
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2670&auto=format&fit=crop',

  expert: {
    name: 'Soumyadeep Datta',
    designation: 'Excel & Productivity Mentor',
    image: '/soumyadeep.png', // served from the website's public root (Hostinger)
    bio:
      'Soumyadeep has trained thousands of professionals to put AI and smart ' +
      'workflows to work in their day-to-day roles — turning hours of manual ' +
      'effort into minutes with the right tools and techniques.',
  },

  schedule: {
    startDate: START,
    startTime: '11:30 AM',
    endTime: '2:30 PM',
  },

  // FREE (struck ₹99). Discounted 0 -> FREE badge + ₹9 convenience fee at cart.
  price: { original: 99, discounted: 0 },

  whatYouWillLearn: [
    { title: 'Formulas That Do the Work', desc: 'VLOOKUP, XLOOKUP, INDEX-MATCH, IFs and the functions pros use daily — explained simply, practiced live.' },
    { title: 'Pivot Tables & Dashboards', desc: 'Turn raw data into clean summaries and visual dashboards your manager will love.' },
    { title: 'Data Cleaning at Speed', desc: 'Text-to-columns, remove duplicates, flash fill — fix messy sheets in seconds, not hours.' },
    { title: 'AI in Excel', desc: 'Use AI to write formulas, analyse data and build reports 10X faster.' },
  ],

  whoIsThisFor: [
    'Working Professionals',
    'Founders & Managers',
    'Freelancers',
    'Students',
  ],

  // NOTE: frontend renders bonuses with Gift icon fallback for plain strings.
  bonuses: [
    'Excel Shortcut Cheatsheet',
    'Practice Workbook',
    'Completion Certificate',
  ],

  faqs: [
    { question: 'Is this masterclass really free?',
      answer: 'Yes — the masterclass itself is free. A small ₹9 convenience fee is collected at checkout to confirm your seat.' },
    { question: 'When is it happening?',
      answer: 'Sunday, 27 September 2026, 11:30 AM to 2:30 PM IST — a live 3-hour session.' },
    { question: 'Do I need Excel installed? Which version?',
      answer: 'Any recent Excel (2016 or newer) or Google Sheets works. Everything is taught step-by-step from the basics.' },
    { question: 'I am a complete beginner. Will I be able to follow?',
      answer: 'Absolutely. The session starts from zero and builds up — no prior Excel expertise needed.' },
    { question: 'Will there be a recording?',
      answer: 'Registered participants get the session details and bonuses. Register to not miss out.' },
  ],

  reviews: [],

  totalSeats: 100,
  enrolledCount: 0,

  manualStatus: 'published',
};

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is missing. Add it to Backend/.env first.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Masterclass.findOne({ slug: SLUG }).lean();

    let saved;
    if (existing) {
      // Refresh the existing doc (updateOne keeps the slug/URL stable).
      const { slug, ...rest } = doc;
      await Masterclass.updateOne({ slug: SLUG }, { $set: rest });
      saved = await Masterclass.findOne({ slug: SLUG }).lean();
      console.log(`🔄 Refreshed existing masterclass "${saved.title}"`);
    } else {
      // Upsert via updateOne: 'save' hooks never run, so the pinned slug
      // is guaranteed. (A bare insert would also work now that the hook
      // respects explicitly-set slugs, but upsert makes re-runs safe.)
      await Masterclass.updateOne({ slug: SLUG }, { $set: doc }, { upsert: true });
      saved = await Masterclass.findOne({ slug: SLUG }).lean();
      console.log(`🆕 Created masterclass "${saved.title}"`);
    }

    console.log(`   When:     ${saved.schedule.startDate.toISOString()} (11:30 AM – 2:30 PM IST)`);
    console.log(`   Price:    ₹${saved.price.original} -> ₹${saved.price.discounted} (₹9 convenience fee at checkout)`);
    console.log(`   Seats:    ${saved.totalSeats}, enrolled: ${saved.enrolledCount}`);
    console.log(`   URL:      /masterclass/${saved.slug}`);
  } catch (err) {
    console.error('❌ Create failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

run();
