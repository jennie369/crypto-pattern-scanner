/**
 * GEM Academy - Optimize Existing Images from Database
 *
 * Script này:
 * 1. Đọc HTML từ DATABASE (giữ nguyên text)
 * 2. Tìm tất cả URL hình ảnh
 * 3. Download hình về local
 * 4. Optimize (nén + resize)
 * 5. Upload hình đã optimize
 * 6. CHỈ thay đổi URL hình trong HTML (không đụng text)
 *
 * USAGE: node scripts/optimizeExistingImages.js tier1 1
 *        node scripts/optimizeExistingImages.js tier1 2
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Supabase configuration
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STORAGE_BUCKET = 'course-images';
const TEMP_FOLDER = 'temp-optimize';

// Optimization settings
const MAX_WIDTH = 1200;
const QUALITY = 85;

// Course ID mapping
const COURSE_MAP = {
  'tier1': 'course-tier1-trading-foundation',
  'tier2': 'course-tier2-trading-advanced',
  'tier3': 'course-tier3-trading-mastery',
};

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Optimize image buffer
async function optimizeImage(inputBuffer) {
  try {
    const optimized = await sharp(inputBuffer)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    return optimized;
  } catch (error) {
    console.error(`   ❌ Optimize error: ${error.message}`);
    return null;
  }
}

// Upload to Supabase Storage
async function uploadToStorage(buffer, storagePath) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    console.error(`   ❌ Upload error: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

// Extract image URLs from HTML
function extractImageUrls(html) {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const urls = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    // Skip placeholder images and data URLs
    if (!url.includes('placehold.co') && !url.startsWith('data:')) {
      urls.push(url);
    }
  }

  return urls;
}

// Process a single lesson
async function processLesson(lesson, chapterNum) {
  console.log(`\n   📄 ${lesson.title}`);

  const imageUrls = extractImageUrls(lesson.html_content);

  if (imageUrls.length === 0) {
    console.log(`      ⚠️  Không có hình ảnh cần optimize`);
    return { optimized: 0, saved: 0 };
  }

  console.log(`      🖼️  Tìm thấy ${imageUrls.length} hình ảnh`);

  let htmlContent = lesson.html_content;
  let totalOptimized = 0;
  let totalSaved = 0;

  for (let i = 0; i < imageUrls.length; i++) {
    const originalUrl = imageUrls[i];

    try {
      // 1. Download
      console.log(`      ⬇️  Downloading hình ${i + 1}...`);
      const originalBuffer = await downloadImage(originalUrl);
      const originalSize = originalBuffer.length;

      // 2. Optimize
      console.log(`      🔧 Optimizing...`);
      const optimizedBuffer = await optimizeImage(originalBuffer);

      if (!optimizedBuffer) {
        console.log(`      ⚠️  Skip (không thể optimize)`);
        continue;
      }

      const newSize = optimizedBuffer.length;

      // Skip if already small enough or optimization made it bigger
      if (newSize >= originalSize * 0.9) {
        console.log(`      ⏭️  Skip (đã tối ưu rồi)`);
        continue;
      }

      // 3. Upload
      const storagePath = `optimized/ch${chapterNum}/${lesson.id}-img${i + 1}.webp`;
      console.log(`      ⬆️  Uploading...`);
      const newUrl = await uploadToStorage(optimizedBuffer, storagePath);

      if (!newUrl) {
        continue;
      }

      // 4. Replace URL in HTML (chỉ thay URL, không đụng text)
      htmlContent = htmlContent.split(originalUrl).join(newUrl);

      const savedBytes = originalSize - newSize;
      const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

      console.log(`      ✅ ${formatSize(originalSize)} → ${formatSize(newSize)} (-${savedPercent}%)`);

      totalOptimized++;
      totalSaved += savedBytes;

    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
  }

  // 5. Update database (chỉ khi có thay đổi)
  if (totalOptimized > 0) {
    const { error } = await supabase
      .from('course_lessons')
      .update({
        html_content: htmlContent,
        content: htmlContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', lesson.id);

    if (error) {
      console.log(`      ❌ Database update error: ${error.message}`);
    } else {
      console.log(`      💾 Đã cập nhật database`);
    }
  }

  return { optimized: totalOptimized, saved: totalSaved };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('');
    console.log('USAGE:');
    console.log('  node scripts/optimizeExistingImages.js <tier> <chapter>');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  node scripts/optimizeExistingImages.js tier1 1');
    console.log('  node scripts/optimizeExistingImages.js tier1 2');
    console.log('');
    process.exit(1);
  }

  const tier = args[0].toLowerCase();
  const chapterNum = parseInt(args[1]);

  const courseId = COURSE_MAP[tier];
  if (!courseId) {
    console.error(`❌ Tier không hợp lệ: ${tier}`);
    return;
  }

  console.log('='.repeat(60));
  console.log('GEM Academy - Optimize Existing Images');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📚 Course: ${courseId}`);
  console.log(`📁 Chapter: ${chapterNum}`);
  console.log(`📐 Max width: ${MAX_WIDTH}px`);
  console.log(`🎨 Quality: ${QUALITY}%`);
  console.log('');
  console.log('⚠️  Script sẽ GIỮ NGUYÊN text, chỉ optimize hình ảnh');
  console.log('');

  // Fetch lessons for this chapter
  const { data: lessons, error } = await supabase
    .from('course_lessons')
    .select('id, title, html_content, module_id')
    .eq('course_id', courseId)
    .order('order_index');

  if (error) {
    console.error(`❌ Error fetching lessons: ${error.message}`);
    return;
  }

  // Filter by chapter (module order_index)
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId)
    .eq('order_index', chapterNum);

  if (!modules || modules.length === 0) {
    console.error(`❌ Không tìm thấy chapter ${chapterNum}`);
    return;
  }

  const moduleId = modules[0].id;
  const chapterLessons = lessons.filter(l => l.module_id === moduleId);

  if (chapterLessons.length === 0) {
    console.error(`❌ Không có bài học trong chapter ${chapterNum}`);
    return;
  }

  console.log(`📄 Tìm thấy ${chapterLessons.length} bài học`);

  let totalOptimized = 0;
  let totalSaved = 0;

  for (const lesson of chapterLessons) {
    const { optimized, saved } = await processLesson(lesson, chapterNum);
    totalOptimized += optimized;
    totalSaved += saved;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Đã optimize: ${totalOptimized} hình ảnh`);
  console.log(`💾 Tiết kiệm: ${formatSize(totalSaved)}`);
  console.log('');
  console.log('🔄 Text nội dung được GIỮ NGUYÊN!');
  console.log('🔄 Chỉ có URL hình ảnh được cập nhật!');
  console.log('='.repeat(60));
}

main().catch(console.error);
