#!/usr/bin/env node

/**
 * ConstructOS Migration Runner (via Supabase REST API)
 * 
 * Executes SQL migrations using Supabase REST API
 * Requires a helper RPC function in Supabase
 * 
 * Usage:
 *   npm run migrate
 * 
 * Setup:
 *   1. Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   2. Create exec_sql RPC function in Supabase (see below)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

config({ path: join(projectRoot, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('\n📝 Get your service role key from:');
  console.error('   Supabase Dashboard → Settings → API → service_role (secret)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const schemaDir = join(projectRoot, 'supabase', 'schema');

function getMigrationFiles() {
  const files = readdirSync(schemaDir)
    .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f))
    .sort();
  return files;
}

async function createHelperRPC() {
  const createRPC = `
CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_text;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
  `;
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ sql_text: createRPC }),
    });
    
    if (response.ok) {
      console.log('✅ Helper RPC function created');
      return true;
    }
  } catch (err) {
    // RPC might not exist yet, that's okay
  }
  
  // Try to create it via direct SQL execution (if we have pg_rest access)
  console.log('\n📋 To enable automatic migrations, run this SQL in Supabase SQL Editor:');
  console.log('\n' + createRPC);
  return false;
}

async function runMigration(filename) {
  const filepath = join(schemaDir, filename);
  const sql = readFileSync(filepath, 'utf-8');
  
  console.log(`\n📄 Running: ${filename}...`);
  
  try {
    // Use REST API to call exec_sql RPC
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_text: sql }),
    });
    
    const result = await response.json();
    
    if (!response.ok || (result.success === false)) {
      throw new Error(result.error || 'Unknown error');
    }
    
    console.log(`✅ Success: ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    console.error(`\n💡 Run this file manually in Supabase SQL Editor:`);
    console.error(`   ${filepath}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  // Check/create helper RPC
  await createHelperRPC();
  
  const files = getMigrationFiles();
  
  if (target === 'all') {
    console.log(`🚀 Running all migrations (${files.length} files)...`);
    let successCount = 0;
    for (const file of files) {
      if (await runMigration(file)) {
        successCount++;
      }
    }
    console.log(`\n✅ Completed: ${successCount}/${files.length} migrations`);
  } else if (target.match(/^\d{3}$/)) {
    const targetFile = files.find(f => f.startsWith(`${target}_`));
    if (targetFile) {
      await runMigration(targetFile);
    } else {
      console.error(`❌ Migration ${target} not found`);
      process.exit(1);
    }
  } else {
    console.error(`Usage: npm run migrate [all|001|002|...]`);
    process.exit(1);
  }
}

main().catch(console.error);

