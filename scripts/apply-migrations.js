/**
 * Migration Script - Apply Database Schema to Supabase
 * 
 * This script reads the migration file and applies it to your Supabase database
 * Run with: node scripts/apply-migrations.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const SUPABASE_URL = 'https://tujfuymkzuzvuacnqjos.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('');
  console.error('To get your service role key:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project: tujfuymkzuzvuacnqjos');
  console.error('3. Go to Settings → API');
  console.error('4. Copy the "service_role" key (not the anon key!)');
  console.error('');
  console.error('Then run:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_key node scripts/apply-migrations.js');
  process.exit(1);
}

// Create Supabase client with service role (has admin permissions)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', 'APPLY_ALL_MIGRATIONS.sql');
    console.log('📄 Reading migration file:', migrationPath);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`);

    // Execute the migration
    console.log('🔄 Applying migration to database...');
    console.log('   This may take 10-30 seconds...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try alternative method - split and execute
      console.log('⚠️  RPC method failed, trying alternative approach...\n');
      await applyMigrationAlternative(migrationSQL);
    } else {
      console.log('✅ Migration applied successfully!\n');
    }

    // Verify tables were created
    await verifyTables();

    console.log('\n🎉 Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Test the likes/views functionality');
    console.log('   3. Check dev_documentation.txt for details\n');

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
    console.error('\n📝 Manual application required:');
    console.error('   1. Go to https://supabase.com/dashboard');
    console.error('   2. Select project: tujfuymkzuzvuacnqjos');
    console.error('   3. SQL Editor → New Query');
    console.error('   4. Copy contents of: supabase/migrations/APPLY_ALL_MIGRATIONS.sql');
    console.error('   5. Paste and click Run\n');
    process.exit(1);
  }
}

async function applyMigrationAlternative(sql) {
  console.log('📝 Note: Some migrations may need manual application via SQL Editor\n');
  console.log('The migration file is ready at:');
  console.log('   supabase/migrations/APPLY_ALL_MIGRATIONS.sql\n');
  throw new Error('Automatic migration not supported - please apply manually via Supabase Dashboard');
}

async function verifyTables() {
  console.log('🔍 Verifying tables...\n');

  const tablesToCheck = [
    'profiles',
    'user_roles',
    'projects',
    'project_likes',
    'project_views',
    'judge_feedback',
    'updates',
    'discussions',
    'registrations'
  ];

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
}

// Run the migration
applyMigration();

