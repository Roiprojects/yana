// Seed all missing admin panel data from the frontend
// Run: node --env-file=.env db/seed-all.mjs
import pg from 'pg';
const { Client } = pg;

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
await c.connect();
console.log('✓ Connected to database');

// ── 1. Hero Slides ────────────────────────────────────────────────────────────
await c.query('DELETE FROM hero_slides');
const heroSlides = [
  {
    title: 'TRAVELING — IT LEAVES YOU SPEECHLESS, THEN TURNS YOU INTO A STORYTELLER',
    subtitle: 'Tailor-made itineraries, group departures & luxury travel across India and the world.',
    image_url: '/hero/homepage-hero-real-16x9-poster.jpg',
    cta_primary_text: 'Explore Packages',
    cta_primary_link: '/packages',
    cta_secondary_text: 'Plan a Custom Trip',
    sort_order: 0,
  },
  {
    title: 'DISCOVER THE WORLD WITH YANA TRAVELS',
    subtitle: 'From the Himalayas to Europe — let us craft the perfect journey for you.',
    image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=92',
    cta_primary_text: 'Group Tours',
    cta_primary_link: '/group-tours',
    cta_secondary_text: 'Contact Us',
    sort_order: 10,
  },
  {
    title: 'YOUR DREAM DESTINATION IS CLOSER THAN YOU THINK',
    subtitle: 'Expert guidance, seamless bookings, and unforgettable experiences since 2005.',
    image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=92',
    cta_primary_text: 'Customized Tours',
    cta_primary_link: '/customized-tours',
    cta_secondary_text: 'View Services',
    sort_order: 20,
  },
];
for (const slide of heroSlides) {
  await c.query(
    `INSERT INTO hero_slides (title, subtitle, image_url, cta_primary_text, cta_primary_link, cta_secondary_text, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
    [slide.title, slide.subtitle, slide.image_url, slide.cta_primary_text, slide.cta_primary_link, slide.cta_secondary_text, slide.sort_order]
  );
}
console.log('✓ Hero slides seeded:', heroSlides.length);

// ── 2. Gallery ────────────────────────────────────────────────────────────────
await c.query('DELETE FROM gallery');
const galleryItems = [
  { title: 'Mountains & North India', category: 'Domestic Tours', image_url: '/themes/theme-mountains.jpg', sort_order: 0 },
  { title: 'Beaches & Islands', category: 'Domestic Tours', image_url: '/themes/theme-beaches.jpg', sort_order: 10 },
  { title: 'Heritage & Pilgrimage', category: 'Domestic Tours', image_url: '/themes/theme-heritage.jpg', sort_order: 20 },
  { title: 'International Escapes', category: 'International Tours', image_url: '/themes/theme-international.jpg', sort_order: 30 },
  { title: 'Kashmir Paradise', category: 'Domestic Tours', image_url: '/packages/kashmir-paradise-5n6d.jpg', sort_order: 40 },
  { title: 'Kerala Backwaters', category: 'Domestic Tours', image_url: '/packages/kerala-backwaters-munnar-5n6d.jpg', sort_order: 50 },
  { title: 'Royal Rajasthan', category: 'Domestic Tours', image_url: '/packages/royal-rajasthan-forts-6n7d.jpg', sort_order: 60 },
  { title: 'Best of Europe', category: 'International Tours', image_url: '/packages/best-of-europe-12n13d.jpg', sort_order: 70 },
  { title: 'Bali Paradise', category: 'International Tours', image_url: '/packages/bali-6n7d.jpg', sort_order: 80 },
  { title: 'Andaman Family', category: 'Domestic Tours', image_url: '/packages/andaman-family-4n5d.jpg', sort_order: 90 },
  { title: 'Singapore & Malaysia', category: 'International Tours', image_url: '/packages/singapore-malaysia-6n7d.jpg', sort_order: 100 },
  { title: 'Leh Ladakh', category: 'Domestic Tours', image_url: '/packages/leh-ladakh-kargil-6n7d.jpg', sort_order: 110 },
];
for (const item of galleryItems) {
  await c.query(
    `INSERT INTO gallery (title, category, image_url, is_active, sort_order) VALUES ($1,$2,$3,true,$4)`,
    [item.title, item.category, item.image_url, item.sort_order]
  );
}
console.log('✓ Gallery items seeded:', galleryItems.length);

// ── 3. Categories ─────────────────────────────────────────────────────────────
await c.query('DELETE FROM categories');
const categories = [
  { name: 'Group Tours', slug: 'group-tours', description: 'Curated departures that feel organised, comfortable, guided, and social.', icon_name: 'Users2', sort_order: 0 },
  { name: 'Customized Tours', slug: 'customized-tours', description: 'Bespoke itineraries shaped completely around your dates, pace, and interests.', icon_name: 'Sparkles', sort_order: 10 },
  { name: 'Tour Packages', slug: 'tour-packages', description: 'Ready-to-enquire domestic and international packages with clear inclusions.', icon_name: 'Compass', sort_order: 20 },
  { name: 'Travel Services', slug: 'travel-services', description: 'Flights, visa filing, forex, hotel bookings, and 24/7 journey coordination.', icon_name: 'Wrench', sort_order: 30 },
  { name: 'Honeymoon Packages', slug: 'honeymoon', description: 'Romantic getaways crafted for couples.', icon_name: 'Heart', sort_order: 40 },
  { name: 'Pilgrimage Tours', slug: 'pilgrimage', description: 'Spiritual journeys to sacred sites across India.', icon_name: 'MapPin', sort_order: 50 },
  { name: 'Adventure Tours', slug: 'adventure', description: 'Thrilling bike trips, treks, and outdoor adventures.', icon_name: 'Mountain', sort_order: 60 },
  { name: 'Cruises', slug: 'cruises', description: 'Luxury cruise packages across world-class destinations.', icon_name: 'Ship', sort_order: 70 },
];
for (const cat of categories) {
  await c.query(
    `INSERT INTO categories (name, slug, description, icon_name, sort_order, is_active) VALUES ($1,$2,$3,$4,$5,true)`,
    [cat.name, cat.slug, cat.description, cat.icon_name, cat.sort_order]
  );
}
console.log('✓ Categories seeded:', categories.length);

// ── 4. Site Settings ──────────────────────────────────────────────────────────
const siteSettings = [
  { key: 'site_name', value: '"Yana Travels"' },
  { key: 'site_tagline', value: '"Reach your dream with us"' },
  { key: 'site_phone_primary', value: '"+91 98765 43210"' },
  { key: 'site_phone_whatsapp', value: '"+91 98765 43210"' },
  { key: 'site_email', value: '"info@yanatravels.com"' },
  { key: 'site_address', value: '"Corporate Office, Udupi, Karnataka"' },
  { key: 'hero_video_desktop', value: '"/hero/homepage-hero-real-16x9.mp4"' },
  { key: 'hero_video_mobile', value: '"/hero/homepage-hero-real-9x16.mp4"' },
  { key: 'hero_poster_desktop', value: '"/hero/homepage-hero-real-16x9-poster.jpg"' },
  { key: 'hero_poster_mobile', value: '"/hero/homepage-hero-real-9x16-poster.jpg"' },
  { key: 'years_experience', value: '"20+"' },
  { key: 'happy_travellers', value: '"10,000+"' },
  { key: 'destinations_count', value: '"50+"' },
  { key: 'packages_count', value: '"200+"' },
];
for (const s of siteSettings) {
  await c.query(
    `INSERT INTO site_settings (key, value, updated_at) VALUES ($1,$2::jsonb,now())
     ON CONFLICT (key) DO UPDATE SET value=excluded.value, updated_at=now()`,
    [s.key, s.value]
  );
}
console.log('✓ Site settings seeded:', siteSettings.length);

// ── Final count ───────────────────────────────────────────────────────────────
const counts = await c.query(`
  SELECT
    (SELECT COUNT(*) FROM tour_packages) AS packages,
    (SELECT COUNT(*) FROM hero_slides)   AS hero_slides,
    (SELECT COUNT(*) FROM gallery)       AS gallery,
    (SELECT COUNT(*) FROM categories)    AS categories,
    (SELECT COUNT(*) FROM site_settings) AS site_settings,
    (SELECT COUNT(*) FROM services)      AS services,
    (SELECT COUNT(*) FROM destinations)  AS destinations,
    (SELECT COUNT(*) FROM testimonials)  AS testimonials,
    (SELECT COUNT(*) FROM faqs)          AS faqs,
    (SELECT COUNT(*) FROM contact_info)  AS offices
`);
console.log('\n✅ DATABASE SYNC COMPLETE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(counts.rows[0]).forEach(([k,v]) => console.log(`  ${k.padEnd(16)} : ${v}`));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

await c.end();
