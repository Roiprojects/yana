// Update site settings with real Yana Travels data
// Run: node --env-file=.env db/seed-settings.mjs
import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: false });
await c.connect();

const settings = {
  site: JSON.stringify({
    phone: "+91 9513588143",
    email: "info@yanaindia.com",
    whatsapp: "919513588143",
    tagline: "Reach your dream with us",
    founded: 2005,
    social: {
      facebook: "https://www.facebook.com/yanatravels",
      instagram: "https://www.instagram.com/yanatravels"
    }
  }),
  about: JSON.stringify({
    headline: "Welcome to Yana Travels",
    intro: "Yana Travels is a premium travel company headquartered in Udupi, Karnataka, with branch offices in Bengaluru and Hubli. We have been crafting unforgettable journeys since 2005.\nWith over two decades of experience, our expert travel advisors design seamless domestic and international tour packages tailored to every kind of traveller — from families and honeymooners to pilgrims and adventure seekers.",
    offerings: "Domestic & International Group Tours\nCustomized Private Holidays\nHoneymoon Packages\nPilgrimage & Heritage Tours\nMICE & Corporate Travel\nFlight, Hotel & Visa Services\nForex & Travel Insurance"
  }),
  seo: JSON.stringify({
    title: "Yana Travels — Reach your dream with us",
    description: "Premium domestic and international group tours, customized holidays, honeymoon packages, pilgrimage tours, and travel services. Headquartered in Udupi with offices in Bengaluru and Hubli."
  })
};

for (const [key, value] of Object.entries(settings)) {
  await c.query(
    `INSERT INTO site_settings (key, value, updated_at) VALUES ($1,$2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value=excluded.value, updated_at=now()`,
    [key, value]
  );
  console.log(`✓ Updated setting: ${key}`);
}

console.log('\n✅ Site settings updated with real Yana Travels data!');
await c.end();
