/**
 * GEM Academy - Optimize AND Upload Images (Combined)
 *
 * Script này:
 * 1. Tìm hình ảnh trong lesson-images/
 * 2. Tự động OPTIMIZE (resize + convert webp)
 * 3. Upload lên Supabase Storage
 * 4. Thay thế placeholder trong database
 *
 * USAGE:
 *   node scripts/optimizeAndUploadImages.js              (tất cả chapters)
 *   node scripts/optimizeAndUploadImages.js tier1-ch4   (chỉ chapter cụ thể)
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STORAGE_BUCKET = 'course-images';
const IMAGES_FOLDER = 'lesson-images';

// Optimization settings
const MAX_WIDTH = 1200;
const QUALITY = 85;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function parseImageFilename(filename) {
  // Parse: 3.2-1.png → { lesson: '3.2', imageNum: 1 }
  // Also handle: 3.2-1.png.png or 3.2-1.PNG
  const match = filename.match(/^(\d+\.\d+)-(\d+)/i);
  if (!match) return null;
  return {
    lesson: match[1],
    imageNum: parseInt(match[2])
  };
}

function getLessonId(chapter, lessonNum) {
  const match = chapter.match(/tier(\d+)-ch(\d+)/);
  if (!match) return null;
  const tier = match[1];
  const ch = match[2];
  const lesson = lessonNum.split('.')[1];
  return `lesson-tier-${tier}-ch${ch}-l${lesson}`;
}

async function optimizeImage(inputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    const optimized = await sharp(inputPath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    return {
      buffer: optimized,
      originalSize,
      newSize: optimized.length
    };
  } catch (error) {
    console.error(`      ❌ Optimize error: ${error.message}`);
    return null;
  }
}

async function uploadToStorage(buffer, storagePath) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    console.error(`      ❌ Upload error: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

async function updateLessonWithImages(lessonId, imageUrls, chapter, lessonNum) {
  // Try structured ID first
  let { data: lesson, error: fetchError } = await supabase
    .from('course_lessons')
    .select('id, html_content, title, course_id')
    .eq('id', lessonId)
    .single();

  // If not found, try finding by title pattern
  if (fetchError || !lesson) {
    const tierMatch = chapter.match(/tier(\d+)/);
    if (tierMatch) {
      const courseId = `course-tier${tierMatch[1]}-trading-foundation`;
      const chapterNum = chapter.match(/ch(\d+)/)?.[1];
      const lessonIdx = lessonNum.split('.')[1];
      const titlePattern = `Bài ${chapterNum}.${lessonIdx}:%`;

      const result = await supabase
        .from('course_lessons')
        .select('id, html_content, title, course_id')
        .eq('course_id', courseId)
        .like('title', titlePattern)
        .single();

      lesson = result.data;
      fetchError = result.error;
    }
  }

  if (fetchError || !lesson) {
    console.log(`      ⚠️  Không tìm thấy lesson: ${lessonId}`);
    return false;
  }

  let htmlContent = lesson.html_content;
  let replacedCount = 0;

  const sortedImages = Object.entries(imageUrls)
    .map(([num, url]) => ({ num: parseInt(num), url }))
    .sort((a, b) => a.num - b.num);

  for (const { num, url } of sortedImages) {
    // Method 1: Find image container before "Hình {num}:" caption
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

    // Method 3: Replace any remaining placehold.co
    const singlePlaceholder = /<img([^>]*)src="https:\/\/placehold\.co\/[^"]+"/i;
    if (singlePlaceholder.test(htmlContent)) {
      htmlContent = htmlContent.replace(singlePlaceholder, `<img$1src="${url}"`);
      replacedCount++;
    }
  }

  if (replacedCount === 0) {
    console.log(`      ⚠️  Không tìm thấy placeholder để thay thế`);
    return false;
  }

  const { error: updateError } = await supabase
    .from('course_lessons')
    .update({
      html_content: htmlContent,
      content: htmlContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', lesson.id);

  if (updateError) {
    console.error(`      ❌ Update failed: ${updateError.message}`);
    return false;
  }

  return replacedCount;
}

async function processChapterFolder(chapterFolder) {
  const projectRoot = path.resolve(__dirname, '..');
  const folderPath = path.join(projectRoot, IMAGES_FOLDER, chapterFolder);

  if (!fs.existsSync(folderPath)) {
    console.log(`   ⚠️  Thư mục không tồn tại: ${folderPath}`);
    return { uploaded: 0, updated: 0, saved: 0 };
  }

  const files = fs.readdirSync(folderPath)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      // Handle double extensions like .png.png
      const name = f.toLowerCase();
      return IMAGE_EXTENSIONS.some(e => name.includes(e.substring(1)));
    })
    .sort();

  if (files.length === 0) {
    console.log(`   ⚠️  Không có hình ảnh trong thư mục`);
    return { uploaded: 0, updated: 0, saved: 0 };
  }

  console.log(`   📷 Tìm thấy ${files.length} hình ảnh`);

  // Group files by lesson
  const lessonImages = {};

  for (const file of files) {
    const parsed = parseImageFilename(file);
    if (!parsed) {
      console.log(`   ⚠️  Tên file không hợp lệ: ${file}`);
      continue;
    }

    if (!lessonImages[parsed.lesson]) {
      lessonImages[parsed.lesson] = {};
    }
    lessonImages[parsed.lesson][parsed.imageNum] = path.join(folderPath, file);
  }

  let uploaded = 0;
  let updated = 0;
  let totalSaved = 0;

  for (const [lessonNum, images] of Object.entries(lessonImages)) {
    const lessonId = getLessonId(chapterFolder, lessonNum);
    if (!lessonId) continue;

    console.log(`   📄 Bài ${lessonNum} (${Object.keys(images).length} hình)`);

    const imageUrls = {};

    for (const [imgNum, localPath] of Object.entries(images)) {
      const originalFilename = path.basename(localPath);

      // Optimize image
      const result = await optimizeImage(localPath);
      if (!result) continue;

      const { buffer, originalSize, newSize } = result;
      const savedBytes = originalSize - newSize;
      totalSaved += savedBytes;

      // Create clean filename (always .webp)
      const cleanName = originalFilename
        .replace(/\.(png|jpg|jpeg|gif|webp)+$/gi, '')
        .replace(/\./g, '-') + '.webp';

      const storagePath = `lessons/${chapterFolder}/${lessonNum}/${cleanName}`;

      const url = await uploadToStorage(buffer, storagePath);
      if (url) {
        imageUrls[imgNum] = url;
        const reduction = ((savedBytes / originalSize) * 100).toFixed(0);
        console.log(`      ✅ ${originalFilename} → ${formatSize(newSize)} (-${reduction}%)`);
        uploaded++;
      }
    }

    if (Object.keys(imageUrls).length > 0) {
      const replacedCount = await updateLessonWithImages(lessonId, imageUrls, chapterFolder, lessonNum);
      if (replacedCount) {
        console.log(`      ✅ Đã thay thế ${replacedCount} hình placeholder`);
        updated++;
      }
    }
  }

  return { uploaded, updated, saved: totalSaved };
}

async function main() {
  const args = process.argv.slice(2);
  const specificFolder = args[0];

  console.log('='.repeat(60));
  console.log('GEM Academy - Optimize & Upload Images');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📐 Max width: ${MAX_WIDTH}px`);
  console.log(`📦 Format: WebP`);
  console.log(`🎨 Quality: ${QUALITY}%`);
  console.log('');

  const projectRoot = path.resolve(__dirname, '..');
  const imagesRoot = path.join(projectRoot, IMAGES_FOLDER);

  if (!fs.existsSync(imagesRoot)) {
    console.log('❌ Thư mục lesson-images/ không tồn tại');
    return;
  }

  let chapterFolders;

  if (specificFolder) {
    if (!fs.existsSync(path.join(imagesRoot, specificFolder))) {
      console.log(`❌ Thư mục ${specificFolder} không tồn tại`);
      return;
    }
    chapterFolders = [specificFolder];
    console.log(`📁 Chỉ xử lý: ${specificFolder}`);
  } else {
    chapterFolders = fs.readdirSync(imagesRoot)
      .filter(f => fs.statSync(path.join(imagesRoot, f)).isDirectory());
  }

  if (chapterFolders.length === 0) {
    console.log('⚠️  Không tìm thấy thư mục chapter nào');
    return;
  }

  let totalUploaded = 0;
  let totalUpdated = 0;
  let totalSaved = 0;

  for (const folder of chapterFolders) {
    console.log(`\n📁 ${folder}`);
    console.log('-'.repeat(50));

    const { uploaded, updated, saved } = await processChapterFolder(folder);
    totalUploaded += uploaded;
    totalUpdated += updated;
    totalSaved += saved;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Đã optimize & upload: ${totalUploaded} hình ảnh`);
  console.log(`✅ Đã update: ${totalUpdated} bài học`);
  console.log(`💾 Tiết kiệm: ${formatSize(totalSaved)}`);
  console.log('');
  console.log('🔄 Tất cả hình đã được optimize thành WebP!');
  console.log('='.repeat(60));
}

main().catch(console.error);
