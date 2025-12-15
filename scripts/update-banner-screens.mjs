/**
 * Script to update sponsor banner target_screens in Supabase
 * Run with: node scripts/update-banner-screens.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateBannerScreens() {
  console.log('Updating sponsor banner target_screens...');

  // First, get all active banners
  const { data: banners, error: fetchError } = await supabase
    .from('sponsor_banners')
    .select('id, title, target_screens')
    .eq('is_active', true);

  if (fetchError) {
    console.error('Error fetching banners:', fetchError);
    return;
  }

  console.log(`Found ${banners?.length || 0} active banners`);

  // Update each banner to include all main screens
  const allScreens = ['home', 'forum', 'shop', 'scanner', 'wallet', 'account'];

  for (const banner of banners || []) {
    console.log(`Updating banner: ${banner.title}`);
    console.log(`  Old screens: ${JSON.stringify(banner.target_screens)}`);

    const { error: updateError } = await supabase
      .from('sponsor_banners')
      .update({ target_screens: allScreens })
      .eq('id', banner.id);

    if (updateError) {
      console.error(`  Error updating: ${updateError.message}`);
    } else {
      console.log(`  New screens: ${JSON.stringify(allScreens)}`);
    }
  }

  console.log('\nDone! All banners updated to show on all main screens.');
}

updateBannerScreens().catch(console.error);
