// One-time seed: creates the AI masterclass for Sat 3 Oct 2026 and fixes the
// Excel masterclass FAQ date. Idempotent — safe to run multiple times.
// Run on the server:  node scripts/sync-masterclass-dates.js
require('dotenv').config();
const mongoose = require('mongoose');
const Masterclass = require('../models/Masterclass');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connected');

    // --- 1. Create the AI masterclass (Sat 3 Oct 2026, 11:30 AM) if missing ---
    const existing = await Masterclass.findOne({ slug: 'excel-masterclass' });
    if (existing) {
        console.log('AI masterclass already exists, skipping create:', existing._id.toString());
    } else {
        const ai = new Masterclass({
            title: '10X Work Productive Gen AI Workshop',
            slug: 'excel-masterclass',
            tagline: "Master practical AI skills you can use right away to work faster, smarter, and better — even if you're completely new to AI.",
            bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
            expert: {
                name: 'Soumyadeep Datta',
                designation: 'Gen AI Expert & Workshop Mentor',
                image: '/soumyadeep.png',
                bio: "Soumyadeep has trained thousands of professionals to put AI to work in their day-to-day roles — turning hours of manual effort into minutes with the right tools and workflow."
            },
            schedule: { startDate: new Date('2026-10-03T00:00:00'), startTime: '11:30', endTime: '14:30' },
            price: { original: 99, discounted: 9 },
            whatYouWillLearn: [
                { title: 'The ACE Framework', desc: 'A clear system to know exactly which AI to use, when, and why — to 10X your output.' },
                { title: 'Hands-on Gen AI Mastery', desc: 'Prompts, projects, skills and connectors — the right way to get output that actually works.' },
                { title: 'Data Analysis with AI', desc: 'Turn raw data into charts, insights and decisions — kill 80% of your Excel work.' },
                { title: 'Build Websites & Decks Live', desc: 'Ship a landing page and a full presentation with zero code, built live in front of you.' }
            ],
            whoIsThisFor: [
                { label: 'Working Professionals' }, { label: 'Founders & Managers' },
                { label: 'Freelancers' }, { label: 'Students' }
            ],
            bonuses: [
                { title: 'Complete AI Setup Guide', desc: 'Step-by-step doc to set up AI correctly from day one.' },
                { title: 'Full Session Notes', desc: 'Every prompt, tool, link and framework, yours to keep.' },
                { title: 'Completion Certificate', desc: 'Official verified badge.' }
            ],
            faqs: [
                { question: 'How much does the workshop cost?', answer: "Just ₹9 — pay at checkout to confirm your seat. That's the full ticket price." },
                { question: 'When is it happening?', answer: 'Saturday, 3 October 2026, 11:30 AM to 2:30 PM IST — a live 3-hour session.' },
                { question: 'Do I need any coding or technical background?', answer: 'Not at all. This session is designed to take you from fundamentals to advanced use with zero code.' },
                { question: 'Will there be a recording?', answer: 'Yes, registered attendees get access to the session recording.' }
            ],
            totalSeats: 100,
            manualStatus: 'published'
        });
        await ai.save();
        console.log('AI masterclass created:', ai._id.toString());
    }

    // --- 2. Fix the Excel masterclass FAQ date ---
    const excel = await Masterclass.findById('6ab79a5f3721d0fa88b1d901');
    if (!excel) {
        console.log('WARNING: Excel masterclass not found, skipping FAQ fix');
    } else {
        const faq = excel.faqs.find(f => f.question === 'When is it happening?');
        if (faq && faq.answer.includes('4 October 2026')) {
            console.log('Excel FAQ date already correct, skipping');
        } else if (faq) {
            faq.answer = 'Sunday, 4 October 2026, 11:30 AM to 2:30 PM IST — a live 3-hour session.';
            await excel.save();
            console.log('Excel FAQ date fixed');
        } else {
            console.log('WARNING: "When is it happening?" FAQ not found on Excel masterclass');
        }
    }

    await mongoose.disconnect();
    console.log('Done');
}

main().catch(err => { console.error('SEED FAILED:', err.message); process.exit(1); });
