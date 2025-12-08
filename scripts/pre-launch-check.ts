/**
 * Pre-Launch Verification Script
 * ShiftCheck Marketing Website
 *
 * Run this script before deploying to production to verify
 * all systems are properly configured.
 *
 * Usage: npx tsx scripts/pre-launch-check.ts
 */

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function log(result: CheckResult) {
  const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
  const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${color}${icon}\x1b[0m ${result.name}: ${result.message}`);
  results.push(result);
}

async function checkEnvironmentVariables() {
  console.log('\n--- Environment Variables ---\n');

  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'BREVO_API_KEY',
    'GROQ_API_KEY',
    'CRON_SECRET',
  ];

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      log({ name: key, status: 'fail', message: 'Not set' });
    } else if (value.includes('xxxxx') || value.includes('[')) {
      log({ name: key, status: 'fail', message: 'Contains placeholder value' });
    } else {
      // Check for test vs live keys
      if (key === 'STRIPE_SECRET_KEY' && value.startsWith('sk_test')) {
        log({ name: key, status: 'warn', message: 'Using TEST key (change for production)' });
      } else if (key === 'VITE_STRIPE_PUBLISHABLE_KEY' && value.startsWith('pk_test')) {
        log({ name: key, status: 'warn', message: 'Using TEST key (change for production)' });
      } else {
        log({ name: key, status: 'pass', message: 'Set' });
      }
    }
  }
}

async function checkBuildStatus() {
  console.log('\n--- Build Status ---\n');

  try {
    const { execSync } = await import('child_process');

    // Check TypeScript
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      log({ name: 'TypeScript', status: 'pass', message: 'No compilation errors' });
    } catch {
      log({ name: 'TypeScript', status: 'fail', message: 'Compilation errors found' });
    }

    // Check tests
    try {
      const testOutput = execSync('npm test 2>&1', { encoding: 'utf-8' });
      const match = testOutput.match(/(\d+) passed/);
      if (match) {
        log({ name: 'Tests', status: 'pass', message: `${match[1]} tests passing` });
      } else {
        log({ name: 'Tests', status: 'warn', message: 'Could not parse test count' });
      }
    } catch {
      log({ name: 'Tests', status: 'fail', message: 'Some tests failing' });
    }
  } catch (error) {
    log({ name: 'Build Check', status: 'fail', message: String(error) });
  }
}

async function checkExternalServices() {
  console.log('\n--- External Services ---\n');

  // Check Supabase connection
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: process.env.VITE_SUPABASE_ANON_KEY || '',
        },
      });
      if (response.ok || response.status === 400) {
        log({ name: 'Supabase', status: 'pass', message: 'Connection successful' });
      } else {
        log({ name: 'Supabase', status: 'fail', message: `HTTP ${response.status}` });
      }
    } else {
      log({ name: 'Supabase', status: 'fail', message: 'URL not configured' });
    }
  } catch (error) {
    log({ name: 'Supabase', status: 'fail', message: 'Connection failed' });
  }

  // Check Stripe connection
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      });
      if (response.ok) {
        log({ name: 'Stripe', status: 'pass', message: 'API connection successful' });
      } else {
        log({ name: 'Stripe', status: 'fail', message: `HTTP ${response.status}` });
      }
    } else {
      log({ name: 'Stripe', status: 'fail', message: 'API key not configured' });
    }
  } catch (error) {
    log({ name: 'Stripe', status: 'fail', message: 'Connection failed' });
  }

  // Check Brevo connection
  try {
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey) {
      const response = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': brevoKey,
        },
      });
      if (response.ok) {
        log({ name: 'Brevo', status: 'pass', message: 'API connection successful' });
      } else {
        log({ name: 'Brevo', status: 'fail', message: `HTTP ${response.status}` });
      }
    } else {
      log({ name: 'Brevo', status: 'fail', message: 'API key not configured' });
    }
  } catch (error) {
    log({ name: 'Brevo', status: 'fail', message: 'Connection failed' });
  }

  // Check Groq connection
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${groqKey}`,
        },
      });
      if (response.ok) {
        log({ name: 'Groq', status: 'pass', message: 'API connection successful' });
      } else {
        log({ name: 'Groq', status: 'fail', message: `HTTP ${response.status}` });
      }
    } else {
      log({ name: 'Groq', status: 'fail', message: 'API key not configured' });
    }
  } catch (error) {
    log({ name: 'Groq', status: 'fail', message: 'Connection failed' });
  }
}

async function checkFiles() {
  console.log('\n--- Required Files ---\n');

  const { existsSync } = await import('fs');
  const { join } = await import('path');

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'vercel.json',
    'api/webhooks/stripe.ts',
    'api/auth/send-verification.ts',
    'api/stripe/create-payment-intent.ts',
    'src/pages/auth/SignUpPage.tsx',
    'src/pages/auth/LoginPage.tsx',
    'database/001_owner_signup_schema.sql',
  ];

  for (const file of requiredFiles) {
    const exists = existsSync(join(process.cwd(), file));
    log({
      name: file,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

async function printSummary() {
  console.log('\n========================================');
  console.log('           PRE-LAUNCH SUMMARY');
  console.log('========================================\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;

  console.log(`\x1b[32m✓ Passed: ${passed}\x1b[0m`);
  console.log(`\x1b[33m⚠ Warnings: ${warned}\x1b[0m`);
  console.log(`\x1b[31m✗ Failed: ${failed}\x1b[0m`);

  console.log('\n----------------------------------------\n');

  if (failed > 0) {
    console.log('\x1b[31m❌ NOT READY FOR LAUNCH\x1b[0m');
    console.log('Fix the failed checks before deploying.\n');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\x1b[33m⚠️  READY WITH WARNINGS\x1b[0m');
    console.log('Review warnings before production deploy.\n');
    process.exit(0);
  } else {
    console.log('\x1b[32m✅ READY FOR LAUNCH!\x1b[0m');
    console.log('All checks passed. Safe to deploy.\n');
    process.exit(0);
  }
}

async function main() {
  console.log('========================================');
  console.log('    ShiftCheck Pre-Launch Check');
  console.log('========================================');
  console.log(`Time: ${new Date().toISOString()}`);

  await checkEnvironmentVariables();
  await checkFiles();
  await checkBuildStatus();
  await checkExternalServices();
  await printSummary();
}

main().catch(console.error);
