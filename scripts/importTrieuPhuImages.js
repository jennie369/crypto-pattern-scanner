/**
 * GEM Academy - Optimize & Upload Images for "Tái Tạo Tư Duy Triệu Phú"
 *
 * Reads PNG images from Hình ảnh/ folder, optimizes (sharp → WebP),
 * uploads to Supabase Storage, and replaces via.placeholder.com URLs
 * in course_lessons.html_content.
 *
 * USAGE:
 *   node scripts/importTrieuPhuImages.js                        # ALL modules
 *   node scripts/importTrieuPhuImages.js --module 2             # Only Module 2
 *   node scripts/importTrieuPhuImages.js --module 1 --lesson 3  # Only M1 Bài 3
 *   node scripts/importTrieuPhuImages.js --dry-run              # Preview only
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STORAGE_BUCKET = 'course-images';
const MAX_WIDTH = 1200;
const QUALITY = 85;

const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(
  PROJECT_ROOT,
  'Tạo Khóa học',
  'Khóa Tư Duy Triệu Phú',
  'output',
  'Hình ảnh'
);

// ── CLI args ────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { module: null, lesson: null, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--module' && args[i + 1]) {
      opts.module = parseInt(args[++i]);
    } else if (args[i] === '--lesson' && args[i + 1]) {
      opts.lesson = parseInt(args[++i]);
    } else if (args[i] === '--dry-run') {
      opts.dryRun = true;
    }
  }
  return opts;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Parse image filename like M1_BAI_03_1.png or M6_BAI_02_02.png
 * Returns { module, lesson, imageNum }
 */
function parseImageFilename(filename) {
  // M{module}_BAI_{lesson}_{imageSeq}.png  — imageSeq may be zero-padded
  const match = filename.match(/^M(\d+)_BAI_(\d+)_(\d+)\.png$/i);
  if (!match) return null;
  return {
    module: parseInt(match[1]),
    lesson: parseInt(match[2]),
    imageNum: parseInt(match[3])
  };
}

function getLessonId(module, lesson) {
  return `lesson-trieuphu-m${module}-l${lesson}`;
}

// ── Sharp optimisation ──────────────────────────────────────────────────────
async function optimizeImage(inputPath) {
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;
  const optimized = await sharp(inputPath)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: QUALITY })
    .toBuffer();
  return { buffer: optimized, originalSize, newSize: optimized.length };
}

// ── Supabase upload ─────────────────────────────────────────────────────────
async function uploadToStorage(buffer, storagePath) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true });

  if (error) {
    console.error(`      ❌ Upload error: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

// ── DB update ───────────────────────────────────────────────────────────────
async function updateLessonWithImages(lessonId, imageUrls) {
  const { data: lesson, error: fetchError } = await supabase
    .from('course_lessons')
    .select('id, html_content, title')
    .eq('id', lessonId)
    .single();

  if (fetchError || !lesson) {
    console.log(`      ⚠️  Không tìm thấy lesson: ${lessonId}`);
    return 0;
  }

  console.log(`      📍 Found: ${lesson.id} — "${lesson.title}"`);

  let html = lesson.html_content;

  // Collect ALL replaceable <img> tags: via.placeholder.com OR previous supabase uploads
  const targetRe = /(<img[^>]*src=")(https:\/\/via\.placeholder\.com\/[^"]+|https:\/\/[^"]*supabase[^"]*\/course-images\/lessons\/trieuphu-[^"]+)("[^>]*>)/gi;
  const targets = [...html.matchAll(targetRe)];

  if (targets.length === 0) {
    console.log(`      ⚠️  Không tìm thấy placeholder hoặc supabase URL để thay thế`);
    return 0;
  }

  // Sort images by imageNum ascending
  const sorted = Object.entries(imageUrls)
    .map(([n, url]) => ({ num: parseInt(n), url }))
    .sort((a, b) => a.num - b.num);

  console.log(`      🔍 ${targets.length} slots, ${sorted.length} images → sequential assignment`);

  // Pure sequential: image 1 → slot 1, image 2 → slot 2, ...
  const count = Math.min(sorted.length, targets.length);
  const replacements = [];
  for (let i = 0; i < count; i++) {
    replacements.push({ match: targets[i], url: sorted[i].url });
    console.log(`         ✓ Image ${sorted[i].num} → slot ${i + 1}`);
  }

  if (sorted.length > targets.length) {
    console.log(`      ⚠️  ${sorted.length - targets.length} image(s) have no slot`);
  }

  // Replace from end-to-start to preserve string positions
  replacements.sort((a, b) => b.match.index - a.match.index);

  for (const { match: m, url } of replacements) {
    const newTag = `${m[1]}${url}${m[3]}`;
    html = html.substring(0, m.index) + newTag + html.substring(m.index + m[0].length);
  }

  const { error: updateError } = await supabase
    .from('course_lessons')
    .update({
      html_content: html,
      content: html,
      updated_at: new Date().toISOString()
    })
    .eq('id', lesson.id);

  if (updateError) {
    console.error(`      ❌ Update failed: ${updateError.message}`);
    return 0;
  }

  return count;
}

// ── Process one module folder ───────────────────────────────────────────────
async function processModule(moduleNum, filterLesson, dryRun) {
  const folderPath = path.join(IMAGES_ROOT, `Module ${moduleNum}`);

  if (!fs.existsSync(folderPath)) {
    console.log(`   ⚠️  Folder not found: Module ${moduleNum}`);
    return { uploaded: 0, replaced: 0, saved: 0 };
  }

  let files = fs.readdirSync(folderPath)
    .filter(f => /\.png$/i.test(f))
    .sort();

  // Group by lesson
  const lessonImages = {}; // { lessonNum: { imageNum: filePath } }

  for (const file of files) {
    const parsed = parseImageFilename(file);
    if (!parsed) {
      console.log(`   ⚠️  Skipping unrecognised file: ${file}`);
      continue;
    }
    if (filterLesson != null && parsed.lesson !== filterLesson) continue;

    if (!lessonImages[parsed.lesson]) lessonImages[parsed.lesson] = {};
    lessonImages[parsed.lesson][parsed.imageNum] = path.join(folderPath, file);
  }

  const lessonNums = Object.keys(lessonImages).map(Number).sort((a, b) => a - b);

  if (lessonNums.length === 0) {
    console.log(`   ⚠️  No matching images found`);
    return { uploaded: 0, replaced: 0, saved: 0 };
  }

  let totalUploaded = 0;
  let totalReplaced = 0;
  let totalSaved = 0;

  for (const lessonNum of lessonNums) {
    const images = lessonImages[lessonNum];
    const imgNums = Object.keys(images).map(Number).sort((a, b) => a - b);
    const lessonId = getLessonId(moduleNum, lessonNum);

    console.log(`   📄 M${moduleNum} Bài ${lessonNum} → ${lessonId} (${imgNums.length} images)`);

    if (dryRun) {
      for (const n of imgNums) {
        console.log(`      [DRY] ${path.basename(images[n])} → placeholder #${n}`);
      }
      continue;
    }

    const imageUrls = {};

    for (const imgNum of imgNums) {
      const localPath = images[imgNum];
      const originalFilename = path.basename(localPath);

      try {
        const { buffer, originalSize, newSize } = await optimizeImage(localPath);
        const savedBytes = originalSize - newSize;
        totalSaved += savedBytes;

        const cleanName = originalFilename
          .replace(/\.png$/i, '')
          .replace(/_/g, '-')
          .toLowerCase();

        const timestamp = Date.now();
        const storagePath = `lessons/trieuphu-m${moduleNum}/${moduleNum}.${lessonNum}/${timestamp}_${cleanName}.webp`;

        const url = await uploadToStorage(buffer, storagePath);
        if (url) {
          imageUrls[imgNum] = url;
          const reduction = ((savedBytes / originalSize) * 100).toFixed(0);
          console.log(`      ✅ ${originalFilename} → ${formatSize(newSize)} (-${reduction}%)`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`      ❌ Error processing ${originalFilename}: ${err.message}`);
      }
    }

    if (Object.keys(imageUrls).length > 0) {
      const count = await updateLessonWithImages(lessonId, imageUrls);
      if (count > 0) {
        console.log(`      ✅ Replaced ${count} placeholder(s) in DB`);
        totalReplaced += count;
      }
    }
  }

  return { uploaded: totalUploaded, replaced: totalReplaced, saved: totalSaved };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs();

  console.log('='.repeat(60));
  console.log('GEM Academy — Triệu Phú Image Upload');
  console.log('='.repeat(60));
  console.log(`📐 Max width: ${MAX_WIDTH}px | 📦 WebP | 🎨 Quality: ${QUALITY}%`);
  if (opts.dryRun) console.log('🔍 DRY RUN — no uploads or DB writes');
  console.log('');

  if (!fs.existsSync(IMAGES_ROOT)) {
    console.log(`❌ Image folder not found: ${IMAGES_ROOT}`);
    process.exit(1);
  }

  // Determine which modules to process
  let modules;
  if (opts.module != null) {
    modules = [opts.module];
    const label = opts.lesson != null
      ? `Module ${opts.module} Bài ${opts.lesson}`
      : `Module ${opts.module} (all lessons)`;
    console.log(`📁 Scope: ${label}`);
  } else {
    // Discover all Module N folders
    modules = fs.readdirSync(IMAGES_ROOT)
      .filter(f => /^Module \d+$/.test(f) && fs.statSync(path.join(IMAGES_ROOT, f)).isDirectory())
      .map(f => parseInt(f.replace('Module ', '')))
      .sort((a, b) => a - b);
    console.log(`📁 Scope: ALL modules (${modules.join(', ')})`);
  }

  console.log('');

  let grandUploaded = 0;
  let grandReplaced = 0;
  let grandSaved = 0;

  for (const mod of modules) {
    console.log(`\n📁 Module ${mod}`);
    console.log('-'.repeat(50));

    const { uploaded, replaced, saved } = await processModule(mod, opts.lesson, opts.dryRun);
    grandUploaded += uploaded;
    grandReplaced += replaced;
    grandSaved += saved;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Uploaded: ${grandUploaded} images`);
  console.log(`✅ Replaced: ${grandReplaced} placeholders in DB`);
  console.log(`💾 Saved: ${formatSize(grandSaved)}`);
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
