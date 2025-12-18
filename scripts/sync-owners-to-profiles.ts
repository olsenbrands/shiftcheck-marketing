/**
 * Sync Owners to Owner Profiles
 *
 * This script syncs existing owners records to owner_profiles table
 * to ensure data is available in both the marketing website and the app.
 *
 * Usage: npx tsx scripts/sync-owners-to-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
// Support multiple env var names for flexibility
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

async function main() {
  console.log('Syncing owners to owner_profiles...\n');

  // Get all owners
  const { data: owners, error: ownersError } = await supabase
    .from('owners')
    .select('id, first_name, last_name, email, phone, created_at');

  if (ownersError) {
    console.error('Error fetching owners:', ownersError.message);
    process.exit(1);
  }

  if (!owners || owners.length === 0) {
    console.log('No owners found to sync.');
    return;
  }

  console.log(`Found ${owners.length} owner(s) to check.\n`);

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  for (const owner of owners as Owner[]) {
    // Check if owner_profile exists
    const { data: existing } = await supabase
      .from('owner_profiles')
      .select('id')
      .eq('owner_id', owner.id)
      .single();

    if (existing) {
      console.log(`[SKIP] ${owner.email} - owner_profiles record already exists`);
      skipped++;
      continue;
    }

    // Create owner_profiles record
    const { error: insertError } = await supabase
      .from('owner_profiles')
      .insert({
        owner_id: owner.id,
        full_name: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        phone: owner.phone,
        receive_sms: true,
        receive_email_reports: true,
        timezone: 'America/New_York',
        preferred_report_time: '8:00 AM',
      });

    if (insertError) {
      console.error(`[ERROR] ${owner.email} - ${insertError.message}`);
      errors++;
    } else {
      console.log(`[SYNCED] ${owner.email} - created owner_profiles record`);
      synced++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Synced: ${synced}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
