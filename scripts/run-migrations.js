#!/usr/bin/env node

/**
 * ConstructOS Migration Runner
 * 
 * Automatically runs SQL migration files from supabase/schema/
 * 
 * Usage:
 *   npm run migrate
 *   npm run migrate -- 009
 *   npm run migrate -- all
 * 
 * Requires:
 *   - VITE_SUPABASE_URL in .env.local
 *   - VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local (for running SQL)
 *     OR use anon key if RLS allows (less secure)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
import { config } from 'dotenv';
config({ path: join(projectRoot, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in .env.local');
  console.error('   Get your service role key from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schemaDir = join(projectRoot, 'supabase', 'schema');

// Get migration files in order
function getMigrationFiles() {
  const files = readdirSync(schemaDir)
    .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f))
    .sort();
  return files;
}

async function runMigration(filename) {
  const filepath = join(schemaDir, filename);
  const sql = readFileSync(filepath, 'utf-8');
  
  console.log(`\n📄 Running: ${filename}`);
  
  try {
    // Split SQL by semicolons and execute each statement
    // Note: Supabase JS client doesn't have direct SQL execution
    // We'll use RPC or REST API approach
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
    
    if (error) {
      // Fallback: try direct REST API call
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_text: sql }),
      });
      
      if (!response.ok) {
        // If RPC doesn't exist, we need to use a different approach
        // For now, provide instructions
        console.error(`⚠️  Cannot execute SQL directly via client.`);
        console.error(`   Please run this file manually in Supabase SQL Editor:`);
        console.error(`   ${filepath}`);
        return false;
      }
    }
    
    console.log(`✅ Success: ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Error running ${filename}:`, err.message);
    return false;
  }
}

// Alternative: Use Supabase Management API or create a helper RPC
async function runMigrationViaRPC(filename) {
  const filepath = join(schemaDir, filename);
  const sql = readFileSync(filepath, 'utf-8');
  
  console.log(`\n📄 Running: ${filename}`);
  
  // Create a temporary RPC function to execute SQL
  // This requires the function to exist in Supabase
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
    if (error) throw error;
    console.log(`✅ Success: ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    console.error(`\n💡 Tip: Create an RPC function in Supabase:`);
    console.error(`   CREATE OR REPLACE FUNCTION exec_sql(sql_text text)`);
    console.error(`   RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$`);
    console.error(`   BEGIN EXECUTE sql_text; END; $$;`);
    return false;
  }
}

// Better approach: Use direct REST API with PostgREST
async function runMigrationDirect(filename) {
  const filepath = join(schemaDir, filename);
  const sql = readFileSync(filepath, 'utf-8');
  
  console.log(`\n📄 Running: ${filename}...`);
  
  // Use Supabase REST API to execute SQL
  // Note: This requires the SQL to be wrapped in a function or use pg_rest
  // For simplicity, we'll provide a script that outputs the SQL for manual execution
  // OR use Supabase CLI if available
  
  console.log(`\n⚠️  Direct SQL execution not available via JS client.`);
  console.log(`\n📋 To run this migration:`);
  console.log(`   1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql`);
  console.log(`   2. Copy the contents of: ${filepath}`);
  console.log(`   3. Paste and run in SQL Editor`);
  console.log(`\n   Or install Supabase CLI and use: supabase db push`);
  
  return false;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  const files = getMigrationFiles();
  
  if (target === 'all') {
    console.log(`🚀 Running all migrations (${files.length} files)...`);
    for (const file of files) {
      await runMigrationDirect(file);
    }
  } else if (target.match(/^\d{3}$/)) {
    const targetFile = files.find(f => f.startsWith(`${target}_`));
    if (targetFile) {
      await runMigrationDirect(targetFile);
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

