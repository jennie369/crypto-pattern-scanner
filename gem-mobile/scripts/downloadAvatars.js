/**
 * Gemral - Download Avatars Script
 * Downloads Vietnamese-looking avatars from RandomUser.me
 * and uploads them to Supabase Storage for offline use
 *
 * Usage: node scripts/downloadAvatars.js
 *
 * Prerequisites:
 * - npm install @supabase/supabase-js node-fetch
 * - Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Number of avatars to download per gender
  maleCount: 300,
  femaleCount: 200,

  // API settings
  randomUserApi: 'https://randomuser.me/api/',
  batchSize: 50, // RandomUser.me max per request

  // Storage settings
  storageBucket: 'avatars',
  storagePath: 'seed-avatars',

  // Fallback: Local storage
  localPath: './assets/seed-avatars',
};

// Supabase client (use service key for admin access)
const supabaseUrl = process.env.SUPABASE_URL || 'https://nhvmfpxdvnbafsdglgpa.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Fetch avatars from RandomUser.me
 * @param {string} gender - 'male' or 'female'
 * @param {number} count - Number of avatars to fetch
 * @returns {Promise<Array<{url: string, gender: string, seed: string}>>}
 */
async function fetchAvatars(gender, count) {
  const avatars = [];
  const batches = Math.ceil(count / CONFIG.batchSize);

  console.log(`\n📥 Fetching ${count} ${gender} avatars (${batches} batches)...`);

  for (let i = 0; i < batches; i++) {
    const batchCount = Math.min(CONFIG.batchSize, count - avatars.length);

    try {
      const response = await fetch(
        `${CONFIG.randomUserApi}?results=${batchCount}&gender=${gender}&inc=picture&nat=jp,kr,cn,vn,th`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      for (const user of data.results) {
        avatars.push({
          url: user.picture.large, // 128x128
          gender,
          seed: `${gender}_${Date.now()}_${avatars.length}`,
        });
      }

      console.log(`  Batch ${i + 1}/${batches}: ${avatars.length}/${count} avatars`);

      // Rate limiting - wait 1 second between batches
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ❌ Batch ${i + 1} failed:`, error.message);
    }
  }

  return avatars;
}

/**
 * Download and upload a single avatar to Supabase Storage
 * @param {Object} avatar - Avatar object with url, gender, seed
 * @param {number} index - Index for filename
 * @returns {Promise<string|null>} - Public URL or null if failed
 */
async function uploadAvatar(avatar, index) {
  try {
    // Download image
    const response = await fetch(avatar.url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const buffer = await response.buffer();

    // Generate filename
    const filename = `${avatar.gender}_${String(index).padStart(4, '0')}.jpg`;
    const storagePath = `${CONFIG.storagePath}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(CONFIG.storageBucket)
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(CONFIG.storageBucket)
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`  ❌ Upload failed for ${avatar.gender}_${index}:`, error.message);
    return null;
  }
}

/**
 * Save avatars locally as fallback
 * @param {Array} avatars - Array of avatar objects
 * @param {string} gender - 'male' or 'female'
 */
async function saveAvatarsLocally(avatars, gender) {
  const localDir = path.join(CONFIG.localPath, gender);

  // Create directory if not exists
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  console.log(`\n💾 Saving ${avatars.length} ${gender} avatars locally...`);

  for (let i = 0; i < avatars.length; i++) {
    try {
      const response = await fetch(avatars[i].url);
      const buffer = await response.buffer();

      const filename = `${gender}_${String(i).padStart(4, '0')}.jpg`;
      const filepath = path.join(localDir, filename);

      fs.writeFileSync(filepath, buffer);

      if ((i + 1) % 50 === 0) {
        console.log(`  Saved ${i + 1}/${avatars.length} ${gender} avatars`);
      }
    } catch (error) {
      console.error(`  ❌ Save failed for ${gender}_${i}:`, error.message);
    }

    // Small delay to avoid rate limiting
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Create avatars bucket if not exists
 */
async function ensureBucketExists() {
  console.log('\n📦 Checking storage bucket...');

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('  ❌ Failed to list buckets:', listError.message);
    return false;
  }

  const bucketExists = buckets.some(b => b.name === CONFIG.storageBucket);

  if (!bucketExists) {
    console.log(`  Creating bucket "${CONFIG.storageBucket}"...`);

    const { error: createError } = await supabase.storage.createBucket(CONFIG.storageBucket, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });

    if (createError) {
      console.error('  ❌ Failed to create bucket:', createError.message);
      return false;
    }

    console.log('  ✅ Bucket created successfully');
  } else {
    console.log('  ✅ Bucket already exists');
  }

  return true;
}

/**
 * Generate avatar URL manifest for use in the app
 * @param {Array} maleUrls - Array of male avatar URLs
 * @param {Array} femaleUrls - Array of female avatar URLs
 */
function generateManifest(maleUrls, femaleUrls) {
  const manifest = {
    generated: new Date().toISOString(),
    male: maleUrls.filter(Boolean),
    female: femaleUrls.filter(Boolean),
    total: maleUrls.filter(Boolean).length + femaleUrls.filter(Boolean).length,
  };

  const manifestPath = path.join(__dirname, '..', 'src', 'data', 'avatarManifest.json');

  // Ensure directory exists
  const dir = path.dirname(manifestPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n📄 Manifest saved to: ${manifestPath}`);
  console.log(`   Total avatars: ${manifest.total}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     GEMRAL - AVATAR DOWNLOAD SCRIPT       ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║ Male avatars to download:   ${String(CONFIG.maleCount).padStart(4)}          ║`);
  console.log(`║ Female avatars to download: ${String(CONFIG.femaleCount).padStart(4)}          ║`);
  console.log('╚════════════════════════════════════════════╝');

  // Check if service key is set
  if (supabaseServiceKey === 'YOUR_SERVICE_KEY_HERE') {
    console.log('\n⚠️  Warning: SUPABASE_SERVICE_KEY not set.');
    console.log('   Will save avatars locally instead of uploading to Supabase.');
    console.log('   Set the environment variable to enable Supabase upload.\n');
  }

  try {
    // Fetch avatars
    const maleAvatars = await fetchAvatars('male', CONFIG.maleCount);
    const femaleAvatars = await fetchAvatars('female', CONFIG.femaleCount);

    console.log(`\n✅ Fetched ${maleAvatars.length} male + ${femaleAvatars.length} female avatars`);

    // Try to upload to Supabase
    let maleUrls = [];
    let femaleUrls = [];

    if (supabaseServiceKey !== 'YOUR_SERVICE_KEY_HERE') {
      const bucketReady = await ensureBucketExists();

      if (bucketReady) {
        console.log('\n☁️  Uploading male avatars to Supabase...');
        for (let i = 0; i < maleAvatars.length; i++) {
          const url = await uploadAvatar(maleAvatars[i], i);
          maleUrls.push(url);

          if ((i + 1) % 50 === 0) {
            console.log(`  Uploaded ${i + 1}/${maleAvatars.length} male avatars`);
          }

          // Rate limiting
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        console.log('\n☁️  Uploading female avatars to Supabase...');
        for (let i = 0; i < femaleAvatars.length; i++) {
          const url = await uploadAvatar(femaleAvatars[i], i);
          femaleUrls.push(url);

          if ((i + 1) % 50 === 0) {
            console.log(`  Uploaded ${i + 1}/${femaleAvatars.length} female avatars`);
          }

          // Rate limiting
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } else {
      // Save locally as fallback
      await saveAvatarsLocally(maleAvatars, 'male');
      await saveAvatarsLocally(femaleAvatars, 'female');

      // Generate local URLs
      maleUrls = maleAvatars.map((_, i) =>
        `file://${path.resolve(CONFIG.localPath, 'male', `male_${String(i).padStart(4, '0')}.jpg`)}`
      );
      femaleUrls = femaleAvatars.map((_, i) =>
        `file://${path.resolve(CONFIG.localPath, 'female', `female_${String(i).padStart(4, '0')}.jpg`)}`
      );
    }

    // Generate manifest
    generateManifest(maleUrls, femaleUrls);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           DOWNLOAD COMPLETED!              ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n💡 Next steps:');
    console.log('   1. Import avatarManifest.json in seedUserGenerator.js');
    console.log('   2. Use manifest.male[index] for random male avatar');
    console.log('   3. Use manifest.female[index] for random female avatar');

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run script
main();
