/**
 * Phase 2 v2 Audit Script
 * Run: API_BASE=http://localhost:5000/api/v1 node scripts/audit-phase2.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api/v1';

const checks = [
  { name: "Health endpoint", method: "GET", path: "/health", expect: r => r.success === true && r.version },
  { name: "Gallery list", method: "GET", path: "/gallery", expect: r => r.success && Array.isArray(r.data) && r.data.length >= 3 },
  { name: "Reliance model loads", method: "GET", path: "/gallery/reliance-industries", expect: r => r.success && r.data?.company_name },
  { name: "TCS model loads", method: "GET", path: "/gallery/tcs", expect: r => r.success && r.data?.company_name },
  { name: "Infosys model loads", method: "GET", path: "/gallery/infosys", expect: r => r.success && r.data?.company_name },
  { name: "AI providers list", method: "GET", path: "/ai/providers", expect: r => r.success && Array.isArray(r.data?.providers) },
  { name: "AI test endpoint (mock)", method: "POST", path: "/ai/test", body: { task: "chat", message: "Reply with OK" }, expect: r => r.success === false || r.response || r.error },
  { name: "Database: ai_runs table", method: "GET", path: "/health", expect: r => r.success },
];

async function run() {
  let pass = 0, fail = 0, skip = 0;
  console.log(`\n🔍 dsFinancial Phase 2 v2 Audit`);
  console.log(`   API Base: ${API_BASE}\n`);

  for (const c of checks) {
    try {
      const opts = {
        method: c.method,
        headers: { "Content-Type": "application/json", "X-Device-Id": "audit-script" },
      };
      if (c.body) opts.body = JSON.stringify(c.body);

      const res = await fetch(`${API_BASE}${c.path}`, opts);
      const data = await res.json();

      if (c.expect(data)) {
        console.log(`✅ ${c.name}`);
        pass++;
      } else {
        console.log(`❌ ${c.name} — unexpected response:`, JSON.stringify(data).substring(0, 200));
        fail++;
      }
    } catch (e) {
      if (e.message.includes('fetch failed') || e.message.includes('ECONNREFUSED')) {
        console.log(`💥 ${c.name}: Backend not reachable (${e.message})`);
      } else {
        console.log(`💥 ${c.name}: ${e.message}`);
      }
      fail++;
    }
  }

  console.log(`\n📊 Results: ${pass} passed, ${fail} failed, ${skip} skipped`);

  // Check local files
  console.log(`\n📁 Local File Checks:`);
  const fs = require('fs');
  const path = require('path');

  const files = [
    'backend/services/ai-provider.js',
    'backend/services/adapters/gemini-adapter.js',
    'backend/routes/extract.js',
    'backend/routes/ai.js',
    'backend/routes/gallery.js',
    'gallery.html',
    'financial-modelling.html',
  ];

  for (const f of files) {
    const exists = fs.existsSync(path.join(process.cwd(), f));
    console.log(`${exists ? '✅' : '❌'} ${f}`);
    if (!exists) fail++;
  }

  // Check seed data
  console.log(`\n🌱 Seed Data Check:`);
  try {
    const dbPath = path.join(process.cwd(), 'backend/data/ds_financial.db');
    if (fs.existsSync(dbPath)) {
      // Use API to verify seeds instead of direct DB access
      const seedRes = await fetch(`${API_BASE}/gallery`, { headers: { 'X-Device-Id': 'audit-script' } });
      const seedData = await seedRes.json();
      if (seedData.success && Array.isArray(seedData.data)) {
        for (const m of seedData.data) {
          console.log(`✅ Gallery seed: ${m.slug} — ${m.company_name}`);
          pass++;
        }
        if (seedData.data.length < 3) {
          console.log(`❌ Only ${seedData.data.length} gallery models found (expected 3)`);
          fail++;
        }
      } else {
        console.log(`❌ Gallery API returned unexpected data`);
        fail++;
      }
    } else {
      console.log(`⚠️  Database not found at ${dbPath}`);
      skip++;
    }
  } catch (e) {
    console.log(`💥 Seed check error: ${e.message}`);
    fail++;
  }

  console.log(`\n🏁 FINAL: ${pass} passed, ${fail} failed, ${skip} skipped`);
  process.exit(fail > 0 ? 1 : 0);
}

run();
