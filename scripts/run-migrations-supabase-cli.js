#!/usr/bin/env node

/**
 * ConstructOS Migration Runner (Supabase CLI)
 * 
 * Uses Supabase CLI to run migrations if available
 * 
 * Usage:
 *   npm run migrate
 * 
 * Requires:
 *   - Supabase CLI installed: npm install -g supabase
 *   - Supabase project linked: supabase link
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const schemaDir = join(projectRoot, 'supabase', 'schema');

function getMigrationFiles() {
  const files = readdirSync(schemaDir)
    .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f))
    .sort();
  return files;
}

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!checkSupabaseCLI()) {
    console.error('❌ Supabase CLI not found.');
    console.error('\n📦 Install it with:');
    console.error('   npm install -g supabase');
    console.error('\n🔗 Then link your project:');
    console.error('   supabase link --project-ref YOUR_PROJECT_REF');
    process.exit(1);
  }
  
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  const files = getMigrationFiles();
  
  if (target === 'all') {
    console.log(`🚀 Running all migrations via Supabase CLI...`);
    for (const file of files) {
      const filepath = join(schemaDir, file);
      console.log(`\n📄 Running: ${file}`);
      try {
        execSync(`supabase db execute --file "${filepath}"`, {
          stdio: 'inherit',
          cwd: projectRoot,
        });
        console.log(`✅ Success: ${file}`);
      } catch (err) {
        console.error(`❌ Error running ${file}`);
        process.exit(1);
      }
    }
  } else if (target.match(/^\d{3}$/)) {
    const targetFile = files.find(f => f.startsWith(`${target}_`));
    if (targetFile) {
      const filepath = join(schemaDir, targetFile);
      console.log(`📄 Running: ${targetFile}`);
      try {
        execSync(`supabase db execute --file "${filepath}"`, {
          stdio: 'inherit',
          cwd: projectRoot,
        });
        console.log(`✅ Success: ${targetFile}`);
      } catch (err) {
        console.error(`❌ Error running ${targetFile}`);
        process.exit(1);
      }
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

