/**
 * verify-db.mjs — Verify Supabase tables, buckets, and RPC functions exist
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(path.join(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

const headers = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function checkTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, { headers });
  return res.ok ? "✅ exists" : `❌ missing (${res.status})`;
}

async function checkRPC(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  // 404 = doesn't exist, any other response means it exists (even an error like "profile not found" is fine)
  return res.status !== 404 ? "✅ exists" : "❌ missing";
}

async function checkBuckets() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, { headers });
  if (!res.ok) return { error: res.status };
  const buckets = await res.json();
  return buckets.map(b => b.name);
}

console.log("🔍 Verifying Supabase database setup...\n");

const [profiles, projects, generations, uploads, buckets, rpc1, rpc2] = await Promise.all([
  checkTable("profiles"),
  checkTable("projects"),
  checkTable("generations"),
  checkTable("uploaded_images"),
  checkBuckets(),
  checkRPC("decrement_credits", { p_user_id: "00000000-0000-0000-0000-000000000000" }),
  checkRPC("add_credits", { p_user_id: "00000000-0000-0000-0000-000000000000", p_amount: 0 }),
]);

console.log("── Tables ──────────────────────────────");
console.log(`  profiles:       ${profiles}`);
console.log(`  projects:       ${projects}`);
console.log(`  generations:    ${generations}`);
console.log(`  uploaded_images:${uploads}`);

console.log("\n── RPC Functions ───────────────────────");
console.log(`  decrement_credits: ${rpc1}`);
console.log(`  add_credits:       ${rpc2}`);

console.log("\n── Storage Buckets ─────────────────────");
if (Array.isArray(buckets)) {
  const required = ["products", "references", "logos", "generated"];
  for (const b of required) {
    console.log(`  ${b}: ${buckets.includes(b) ? "✅ exists" : "❌ missing"}`);
  }
} else {
  console.log("  ❌ Could not fetch buckets");
}

console.log("\n✅ Verification complete!");
