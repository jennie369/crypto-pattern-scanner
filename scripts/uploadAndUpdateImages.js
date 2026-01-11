/**
 * GEM Academy - Upload Local Images & Update Lessons
 * Tìm placeholder images (placehold.co) và thay thế bằng hình thật
 *
 * HƯỚNG DẪN:
 * 1. Đặt hình ảnh vào thư mục lesson-images/ theo cấu trúc:
 *    lesson-images/
 *    ├── tier1-ch3/
 *    │   ├── 3.2-1.png   (Bài 3.2, hình 1 - thay cho "Hình 1")
 *    │   ├── 3.2-2.png   (Bài 3.2, hình 2 - thay cho "Hình 2")
 *    │   └── ...
 *    └── tier1-ch4/
 *        └── ...
 *
 * 2. Chạy: node scripts/uploadAndUpdateImages.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STORAGE_BUCKET = 'course-images';
const IMAGES_FOLDER = 'lesson-images';

// Supported image formats
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

function parseImageFilename(filename) {
  // Parse: 3.2-1.png → { lesson: '3.2', imageNum: 1 }
  const match = filename.match(/^(\d+\.\d+)-(\d+)/);
  if (!match) return null;
  return {
    lesson: match[1],
    imageNum: parseInt(match[2])
  };
}

function getLessonId(chapter, lessonNum) {
  // chapter: 'tier1-ch3' → tier: 1, ch: 3
  const match = chapter.match(/tier(\d+)-ch(\d+)/);
  if (!match) return null;

  const tier = match[1];
  const ch = match[2];
  const lesson = lessonNum.split('.')[1]; // '3.2' → '2'

  return `lesson-tier-${tier}-ch${ch}-l${lesson}`;
}

async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === STORAGE_BUCKET);

  if (!exists) {
    console.log(`📦 Tạo bucket: ${STORAGE_BUCKET}`);
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Lỗi tạo bucket:', error.message);
      return false;
    }
  }
  return true;
}

async function uploadImage(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();

  const contentType = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  }[ext] || 'image/png';

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

async function updateLessonWithImages(lessonId, imageUrls) {
  // Get current lesson
  const { data: lesson, error: fetchError } = await supabase
    .from('course_lessons')
    .select('html_content, title')
    .eq('id', lessonId)
    .single();

  if (fetchError || !lesson) {
    console.error(`   ❌ Không tìm thấy lesson: ${lessonId}`);
    return false;
  }

  let htmlContent = lesson.html_content;
  let replacedCount = 0;

  // Strategy: Find placeholder images and replace them
  // Pattern 1: placehold.co URLs
  // Pattern 2: Match by "Hình X" caption and find the img above it

  // Sort images by number
  const sortedImages = Object.entries(imageUrls)
    .map(([num, url]) => ({ num: parseInt(num), url }))
    .sort((a, b) => a.num - b.num);

  for (const { num, url } of sortedImages) {
    // Method 1: Find image container before "Hình {num}:" caption
    // Look for pattern: <img src="...">...</div>...<div class="image-caption">Hình {num}:

    const captionPattern = new RegExp(
      `(<div[^>]*class="image-container"[^>]*>\\s*<img[^>]*src=")([^"]+)("[^>]*>\\s*</div>\\s*<div[^>]*class="image-caption"[^>]*>\\s*Hình\\s*${num}[:\\s])`,
      'i'
    );

    if (captionPattern.test(htmlContent)) {
      htmlContent = htmlContent.replace(captionPattern, `$1${url}$3`);
      replacedCount++;
      continue;
    }

    // Method 2: Find nth placehold.co image
    const placeholderPattern = /(<img[^>]*src=")(https:\/\/placehold\.co\/[^"]+)("[^>]*>)/gi;
    let matches = [...htmlContent.matchAll(placeholderPattern)];

    if (matches.length >= num && matches[num - 1]) {
      const match = matches[num - 1];
      const oldImgTag = match[0];
      const newImgTag = `${match[1]}${url}${match[3]}`;
      htmlContent = htmlContent.replace(oldImgTag, newImgTag);
      replacedCount++;
      continue;
    }

    // Method 3: Find any img with placehold.co and replace sequentially
    const singlePlaceholder = /<img([^>]*)src="https:\/\/placehold\.co\/[^"]+"/i;
    if (singlePlaceholder.test(htmlContent)) {
      htmlContent = htmlContent.replace(singlePlaceholder, `<img$1src="${url}"`);
      replacedCount++;
    }
  }

  if (replacedCount === 0) {
    console.log(`   ⚠️  Không tìm thấy placeholder để thay thế`);
    return false;
  }

  // Update database
  const { error: updateError } = await supabase
    .from('course_lessons')
    .update({
      html_content: htmlContent,
      content: htmlContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId);

  if (updateError) {
    console.error(`   ❌ Update failed: ${updateError.message}`);
    return false;
  }

  return replacedCount;
}

async function processChapterFolder(chapterFolder) {
  const projectRoot = path.resolve(__dirname, '..');
  const folderPath = path.join(projectRoot, IMAGES_FOLDER, chapterFolder);

  if (!fs.existsSync(folderPath)) {
    console.log(`   ⚠️  Thư mục không tồn tại: ${folderPath}`);
    return { uploaded: 0, updated: 0 };
  }

  const files = fs.readdirSync(folderPath)
    .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log(`   ⚠️  Không có hình ảnh trong thư mục`);
    return { uploaded: 0, updated: 0 };
  }

  console.log(`   📷 Tìm thấy ${files.length} hình ảnh`);

  // Group files by lesson
  const lessonImages = {};

  for (const file of files) {
    const parsed = parseImageFilename(file);
    if (!parsed) {
      console.log(`   ⚠️  Tên file không hợp lệ: ${file} (cần format: 3.2-1.png)`);
      continue;
    }

    if (!lessonImages[parsed.lesson]) {
      lessonImages[parsed.lesson] = {};
    }
    lessonImages[parsed.lesson][parsed.imageNum] = path.join(folderPath, file);
  }

  let uploaded = 0;
  let updated = 0;

  // Process each lesson
  for (const [lessonNum, images] of Object.entries(lessonImages)) {
    const lessonId = getLessonId(chapterFolder, lessonNum);
    if (!lessonId) continue;

    console.log(`   📄 Bài ${lessonNum} (${Object.keys(images).length} hình)`);

    const imageUrls = {};

    // Upload each image
    for (const [imgNum, localPath] of Object.entries(images)) {
      const filename = path.basename(localPath);
      const storagePath = `lessons/${chapterFolder}/${lessonNum}/${filename}`;

      const url = await uploadImage(localPath, storagePath);
      if (url) {
        imageUrls[imgNum] = url;
        console.log(`      ✅ Uploaded: ${filename}`);
        uploaded++;
      }
    }

    // Update lesson HTML - replace placeholders
    if (Object.keys(imageUrls).length > 0) {
      const replacedCount = await updateLessonWithImages(lessonId, imageUrls);
      if (replacedCount) {
        console.log(`      ✅ Đã thay thế ${replacedCount} hình placeholder`);
        updated++;
      }
    }
  }

  return { uploaded, updated };
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Upload & Replace Placeholder Images');
  console.log('='.repeat(60));
  console.log('');

  // Ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('❌ Không thể tạo storage bucket');
    return;
  }

  const projectRoot = path.resolve(__dirname, '..');
  const imagesRoot = path.join(projectRoot, IMAGES_FOLDER);

  if (!fs.existsSync(imagesRoot)) {
    console.log('❌ Thư mục lesson-images/ không tồn tại');
    console.log('');
    console.log('📁 Hãy tạo thư mục và đặt hình ảnh theo cấu trúc:');
    console.log('');
    console.log('   lesson-images/');
    console.log('   ├── tier1-ch3/');
    console.log('   │   ├── 3.2-1.png  (thay cho Hình 1 trong bài 3.2)');
    console.log('   │   ├── 3.2-2.png  (thay cho Hình 2 trong bài 3.2)');
    console.log('   │   └── ...');
    console.log('   └── tier1-ch4/');
    console.log('       └── ...');
    return;
  }

  // Get all chapter folders
  const chapterFolders = fs.readdirSync(imagesRoot)
    .filter(f => fs.statSync(path.join(imagesRoot, f)).isDirectory());

  if (chapterFolders.length === 0) {
    console.log('⚠️  Không tìm thấy thư mục chapter nào');
    return;
  }

  let totalUploaded = 0;
  let totalUpdated = 0;

  for (const folder of chapterFolders) {
    console.log(`\n📁 ${folder}`);
    console.log('-'.repeat(50));

    const { uploaded, updated } = await processChapterFolder(folder);
    totalUploaded += uploaded;
    totalUpdated += updated;
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Đã upload: ${totalUploaded} hình ảnh`);
  console.log(`✅ Đã update: ${totalUpdated} bài học`);
  console.log('');
  console.log('🔄 Placeholder images đã được thay bằng hình thật!');
  console.log('='.repeat(60));
}

main().catch(console.error);
