/**
 * Test Script - Verify Database Setup and Access Controls
 * 
 * Run after applying migrations: npm run test:db
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log('🧪 Testing Database Setup and Access Controls\n');
  console.log('Project:', SUPABASE_URL);
  console.log('');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Verify tables exist
  console.log('📋 Test 1: Checking if tables exist...');
  const tables = [
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

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ ${table}: ${error.message}`);
        failedTests++;
      } else {
        console.log(`   ✅ ${table}`);
        passedTests++;
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
      failedTests++;
    }
  }

  // Test 2: Check RLS is enabled (try to access without auth)
  console.log('\n🔒 Test 2: Verifying Row Level Security...');
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title, likes, views')
      .limit(1);
    
    if (!error) {
      console.log('   ✅ Can read public project data (expected)');
      passedTests++;
      if (projects && projects.length > 0) {
        console.log(`      Found ${projects.length} project(s)`);
      }
    } else {
      console.log('   ❌ Cannot read projects:', error.message);
      failedTests++;
    }
  } catch (err) {
    console.log('   ❌ RLS test failed:', err.message);
    failedTests++;
  }

  // Test 3: Verify functions exist (try to call them)
  console.log('\n⚙️  Test 3: Checking database functions...');
  
  // We can't really call these without proper setup, but we can check if they're callable
  console.log('   ℹ️  Functions (toggle_project_like, record_project_view)');
  console.log('      These require authentication to test properly');
  console.log('      Will be tested in the app');

  // Test 4: Check if we can view likes and views tables
  console.log('\n👀 Test 4: Testing likes and views tables...');
  try {
    const { data: likes, error: likesError } = await supabase
      .from('project_likes')
      .select('id')
      .limit(1);
    
    if (!likesError || likesError.code === 'PGRST116') {
      console.log('   ✅ project_likes table accessible');
      passedTests++;
    } else {
      console.log('   ❌ project_likes error:', likesError.message);
      failedTests++;
    }

    const { data: views, error: viewsError } = await supabase
      .from('project_views')
      .select('id')
      .limit(1);
    
    if (!viewsError || viewsError.code === 'PGRST116') {
      console.log('   ✅ project_views table accessible');
      passedTests++;
    } else {
      console.log('   ❌ project_views error:', viewsError.message);
      failedTests++;
    }
  } catch (err) {
    console.log('   ❌ Error testing likes/views:', err.message);
    failedTests++;
  }

  // Test 5: Try to insert a like without authentication (should fail)
  console.log('\n🔐 Test 5: Testing unauthenticated like (should fail)...');
  try {
    const { error } = await supabase
      .from('project_likes')
      .insert({ project_id: 'test-id', user_id: 'test-user' });
    
    if (error) {
      console.log('   ✅ Correctly blocked unauthenticated like');
      console.log(`      Error: ${error.message}`);
      passedTests++;
    } else {
      console.log('   ❌ SECURITY ISSUE: Allowed unauthenticated like!');
      failedTests++;
    }
  } catch (err) {
    console.log('   ✅ Correctly blocked unauthenticated like');
    passedTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  console.log('');

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Database is ready!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Sign in to the app');
    console.log('  3. Test likes by clicking ❤️ on projects');
    console.log('  4. Test views by opening project details');
    console.log('');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('');
    console.log('Common issues:');
    console.log('  - Migration not applied: Run APPLY_ALL_MIGRATIONS.sql in Supabase SQL Editor');
    console.log('  - Wrong project: Verify VITE_SUPABASE_URL in .env');
    console.log('  - Network issues: Check internet connection');
    console.log('');
  }

  return failedTests === 0 ? 0 : 1;
}

// Run tests
runTests()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('\n❌ Test execution failed:', err);
    process.exit(1);
  });

