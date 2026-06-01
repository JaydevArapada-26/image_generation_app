/**
 * migrate.mjs — Run Supabase migrations using the Management API
 * Uses the service role key already in .env.local (no login needed)
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env vars from .env.local manually
const envFile = readFileSync(path.join(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
const mgmtApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

async function runSQL(label, sql) {
  console.log(`\n⏳ Running: ${label}...`);
  const res = await fetch(mgmtApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();

  if (!res.ok) {
    // Fallback: try the pg REST endpoint via PostgREST rpc (won't work for DDL)
    // Show the raw error for the user
    console.error(`❌ ${label} FAILED (HTTP ${res.status}):`);
    try {
      const json = JSON.parse(text);
      console.error(JSON.stringify(json, null, 2));
    } catch {
      console.error(text);
    }
    return false;
  }

  console.log(`✅ ${label} succeeded!`);
  return true;
}

const sql001 = readFileSync(path.join(__dirname, "../supabase/migrations/001_init.sql"), "utf-8");
const sql002 = readFileSync(path.join(__dirname, "../supabase/migrations/002_rpc.sql"), "utf-8");

console.log("🚀 Antigravity — Running Supabase migrations");
console.log(`   Project: ${SUPABASE_URL}`);

const ok1 = await runSQL("001_init.sql (schema, tables, RLS, storage)", sql001);
const ok2 = await runSQL("002_rpc.sql (credit RPC functions)", sql002);

if (ok1 && ok2) {
  console.log("\n🎉 All migrations applied successfully! Your database is fully set up.");
} else {
  console.log("\n⚠️  Some migrations failed. Check the errors above.");
  console.log("    The Supabase Management API requires an access token, not a service role key.");
  console.log("    Run migrations manually via: https://supabase.com/dashboard/project/" + projectRef + "/sql/new");
}
