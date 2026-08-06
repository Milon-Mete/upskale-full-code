/**
 * 🔄 ONE-TIME UPDATE: "10X Work Productive Gen AI Workshop"
 *
 * Repurposes the existing masterclass (slug: gen-ai-tools-masterclass) into the
 * free 10X Gen AI workshop. Uses updateOne so the pre('save') slug hook does NOT
 * run — the URL /masterclass/gen-ai-tools-masterclass stays exactly the same.
 *
 * Sets: title, price (99 -> 0), tagline, mentor (Soumyadeep Datta), and FAQs.
 * Leaves whatYouWillLearn / whoIsThisFor empty on purpose so the frontend shows
 * its built-in "ACE Framework" curriculum. Schedule, bannerImage, seats and
 * enrolledCount are left untouched.
 *
 * Price 0 = FREE, which triggers the ₹9 convenience fee at checkout
 * (see routes/paymentMasterclass.js).
 *
 * Usage:  node scripts/update-genai-workshop.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Masterclass = require('../models/Masterclass');

const SLUG = 'gen-ai-tools-masterclass';

const update = {
  title: '10X Work Productive Gen AI Workshop',

  // FREE (was ₹99). Discounted 0 -> FREE badge + ₹9 convenience fee at cart.
  price: { original: 99, discounted: 0 },

  tagline:
    "A hands-on 1-hour live workshop to make AI actually work in your day-to-day — " +
    "learn the ACE Framework and 10X your output. No coding experience needed.",

  expert: {
    name: 'Soumyadeep Datta',
    designation: 'Gen AI Expert & Workshop Mentor',
    image: '/soumyadeep.png', // served from the website's public root (Hostinger)
    bio:
      'Soumyadeep has trained thousands of professionals to put AI to work in their ' +
      'day-to-day roles — turning hours of manual effort into minutes with the right ' +
      'tools and workflow.',
  },

  faqs: [
    { question: 'Is this workshop really free?',
      answer: 'Yes — the workshop itself is free. A small ₹9 convenience fee is collected at checkout to confirm your seat.' },
    { question: 'Do I need any coding or technical background?',
      answer: 'Not at all. Everything is taught step-by-step and is designed for complete beginners.' },
    { question: 'How long is the workshop?',
      answer: 'It is a focused 1-hour live session, including a live walkthrough of real AI workflows.' },
    { question: 'Will I get a recording if I miss it?',
      answer: 'Register anyway — details about access are shared with registered participants.' },
    { question: 'Who is this workshop for?',
      answer: 'Working professionals, founders, freelancers and students who want to use AI to work faster and smarter.' },
  ],
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const before = await Masterclass.findOne({ slug: SLUG }).lean();
    if (!before) {
      console.error(`❌ No masterclass found with slug "${SLUG}". Aborting.`);
      process.exit(1);
    }
    console.log(`Found: "${before.title}"  (price ${before.price.original} -> ${before.price.discounted})`);

    const res = await Masterclass.updateOne({ slug: SLUG }, { $set: update });
    console.log(`✏️  matched ${res.matchedCount}, modified ${res.modifiedCount}`);

    const after = await Masterclass.findOne({ slug: SLUG }).lean();
    console.log(`✅ Now: "${after.title}"  (price ${after.price.original} -> ${after.price.discounted}),  mentor: ${after.expert.name}`);
    console.log(`   URL unchanged: /masterclass/${after.slug}`);
  } catch (err) {
    console.error('❌ Update failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

run();
