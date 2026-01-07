#!/usr/bin/env node

/**
 * Setup Migration Helper RPC
 * 
 * Creates the exec_sql RPC function needed for automatic migrations
 * Run this ONCE before using npm run migrate
 */

import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

config({ path: join(projectRoot, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const setupSQL = `
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

async function main() {
  console.log('🔧 Setting up migration helper RPC...\n');
  console.log('📋 Run this SQL in Supabase SQL Editor:\n');
  console.log('─'.repeat(60));
  console.log(setupSQL);
  console.log('─'.repeat(60));
  console.log('\n📍 URL: https://app.supabase.com/project/_/sql');
  console.log('\n✅ After running the SQL above, you can use: npm run migrate');
}

main().catch(console.error);

