#!/usr/bin/env node

/**
 * ConstructOS Migration Runner (Simple - Uses Supabase JS Client)
 * 
 * This script reads SQL files and provides instructions for running them.
 * For actual execution, it uses Supabase's REST API with a helper RPC.
 * 
 * Usage:
 *   npm run migrate
 *   npm run migrate -- 009
 * 
 * Setup:
 *   1. Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   2. Run the setup RPC (first time only)
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
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('\n📝 Get it from: Supabase Dashboard → Settings → API → service_role (secret)');
  console.error('   ⚠️  Keep this key secret! Never commit it to git.');
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

async function setupHelperRPC() {
  console.log('🔧 Setting up helper RPC function...');
  
  const setupSQL = `
-- Run this ONCE in Supabase SQL Editor to enable automatic migrations
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
  `.trim();
  
  try {
    // Try to create the RPC via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_text: setupSQL }),
    });
    
    if (response.ok) {
      console.log('✅ Helper RPC ready');
      return true;
    }
  } catch (err) {
    // RPC doesn't exist yet, that's expected
  }
  
  console.log('\n📋 First-time setup required:');
  console.log('   1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql');
  console.log('   2. Run this SQL:');
  console.log('\n' + setupSQL + '\n');
  console.log('   3. Then run migrations again: npm run migrate');
  return false;
}

async function runMigration(filename) {
  const filepath = join(schemaDir, filename);
  const sql = readFileSync(filepath, 'utf-8');
  
  console.log(`\n📄 Running: ${filename}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
    
    if (error) {
      if (error.message.includes('function exec_sql') || error.code === '42883') {
        console.error('⚠️  Helper RPC not found. Run setup first.');
        await setupHelperRPC();
        return false;
      }
      throw error;
    }
    
    if (data && data.success === false) {
      const errorMsg = data.error || 'SQL execution failed';
      // Check if error is about object already existing (safe to skip)
      if (errorMsg.includes('already exists') || 
          errorMsg.includes('duplicate key') ||
          errorMsg.includes('relation') && errorMsg.includes('already exists')) {
        console.log(`⚠️  Skipped (already exists): ${filename}`);
        return true; // Continue - object already exists is OK
      }
      throw new Error(errorMsg);
    }
    
    console.log(`✅ Success: ${filename}`);
    return true;
  } catch (err) {
    const errMsg = err.message || String(err);
    // Check if error is about object already existing (safe to skip)
    if (errMsg.includes('already exists') || 
        errMsg.includes('duplicate key') ||
        (errMsg.includes('relation') && errMsg.includes('already exists'))) {
      console.log(`⚠️  Skipped (already exists): ${filename}`);
      return true; // Continue - object already exists is OK
    }
    
    console.error(`❌ Error: ${errMsg}`);
    console.error(`\n💡 Manual execution:`);
    console.error(`   File: ${filepath}`);
    console.error(`   Copy contents to Supabase SQL Editor and run`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  // Check if helper RPC exists
  try {
    await supabase.rpc('exec_sql', { sql_text: 'SELECT 1' });
  } catch {
    console.log('⚠️  Helper RPC not found. Setting up...\n');
    const setup = await setupHelperRPC();
    if (!setup) {
      console.log('\n⏸️  Please complete setup above, then run migrations again.');
      process.exit(0);
    }
  }
  
  const files = getMigrationFiles();
  
  if (target === 'all') {
    console.log(`🚀 Running all migrations (${files.length} files)...\n`);
    let successCount = 0;
    for (const file of files) {
      if (await runMigration(file)) {
        successCount++;
      } else {
        console.log(`\n⏸️  Stopping due to error. Fix and continue manually.`);
        break;
      }
    }
    console.log(`\n✅ Completed: ${successCount}/${files.length} migrations`);
  } else if (target.match(/^\d{3}$/)) {
    const targetFile = files.find(f => f.startsWith(`${target}_`));
    if (targetFile) {
      await runMigration(targetFile);
    } else {
      console.error(`❌ Migration ${target} not found`);
      console.log(`\nAvailable migrations:`);
      files.forEach(f => console.log(`   ${f}`));
      process.exit(1);
    }
  } else {
    console.error(`Usage: npm run migrate [all|001|002|...]`);
    console.log(`\nAvailable migrations:`);
    files.forEach(f => console.log(`   ${f}`));
    process.exit(1);
  }
}

main().catch(console.error);

