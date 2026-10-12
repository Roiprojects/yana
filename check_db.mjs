import pg from 'pg';
const { Client } = pg;
const c = new Client({
  connectionString: 'postgres://yanat710:5UwsNVK0RI0DGVsC4BOmR9cLP@168.119.64.101:5432/yanat710',
  ssl: false
});
await c.connect();

// List all tables
const tables = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log('\n=== DATABASE TABLES ===');
tables.rows.forEach(r => console.log(' -', r.table_name));

// Check counts
for (const tbl of tables.rows) {
  const cnt = await c.query(`SELECT COUNT(*) FROM ${tbl.table_name}`);
  console.log(`  ${tbl.table_name}: ${cnt.rows[0].count} rows`);
}

await c.end();
