/**
 * GEM Academy - Optimize Single Lesson Images
 *
 * USAGE: node scripts/optimizeSingleLesson.js tier1 3 1
 *        (tier1, chapter 3, lesson 1 = bài 3.1)
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const https = require('https');
const http = require('http');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STORAGE_BUCKET = 'course-images';
const MAX_WIDTH = 1200;
const QUALITY = 85;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function optimizeImage(inputBuffer) {
  return sharp(inputBuffer)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: QUALITY })
    .toBuffer();
}

async function uploadToStorage(buffer, storagePath) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function extractImageUrls(html) {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const urls = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (!url.includes('placehold.co') && !url.startsWith('data:')) {
      urls.push(url);
    }
  }
  return urls;
}

const COURSE_MAP = {
  'tier1': 'course-tier1-trading-foundation',
  'tier2': 'course-tier2-trading-advanced',
  'tier3': 'course-tier3-trading-mastery',
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('USAGE: node scripts/optimizeSingleLesson.js <tier> <chapter> <lesson>');
    console.log('EXAMPLE: node scripts/optimizeSingleLesson.js tier1 3 1');
    process.exit(1);
  }

  const tier = args[0].toLowerCase();
  const chapter = args[1];
  const lessonNum = args[2];
  const courseId = COURSE_MAP[tier];
  const titlePattern = `Bài ${chapter}.${lessonNum}:%`;

  console.log('='.repeat(60));
  console.log(`Optimize Bài ${chapter}.${lessonNum}`);
  console.log('='.repeat(60));
  console.log(`Course: ${courseId}`);
  console.log(`Looking for: ${titlePattern}`);
  console.log('');

  // Find lesson by title pattern (handles both old and new ID formats)
  const { data: lesson, error } = await supabase
    .from('course_lessons')
    .select('id, title, html_content')
    .eq('course_id', courseId)
    .like('title', titlePattern)
    .single();

  if (error || !lesson) {
    console.error(`❌ Không tìm thấy bài học: Bài ${chapter}.${lessonNum}`);
    return;
  }

  console.log(`📄 ${lesson.title}`);

  const imageUrls = extractImageUrls(lesson.html_content);

  if (imageUrls.length === 0) {
    console.log(`⚠️  Không có hình ảnh cần optimize`);
    return;
  }

  console.log(`🖼️  Tìm thấy ${imageUrls.length} hình ảnh`);

  let htmlContent = lesson.html_content;
  let optimized = 0;
  let totalSaved = 0;

  for (let i = 0; i < imageUrls.length; i++) {
    const originalUrl = imageUrls[i];
    try {
      console.log(`\n⬇️  Downloading hình ${i + 1}...`);
      const originalBuffer = await downloadImage(originalUrl);
      const originalSize = originalBuffer.length;

      console.log(`🔧 Optimizing...`);
      const optimizedBuffer = await optimizeImage(originalBuffer);
      const newSize = optimizedBuffer.length;

      if (newSize >= originalSize * 0.9) {
        console.log(`⏭️  Skip (đã tối ưu rồi)`);
        continue;
      }

      const storagePath = `optimized/ch${chapter}/${lesson.id}-img${i + 1}.webp`;
      console.log(`⬆️  Uploading...`);
      const newUrl = await uploadToStorage(optimizedBuffer, storagePath);

      if (!newUrl) continue;

      htmlContent = htmlContent.split(originalUrl).join(newUrl);

      const saved = originalSize - newSize;
      console.log(`✅ ${formatSize(originalSize)} → ${formatSize(newSize)} (-${((saved / originalSize) * 100).toFixed(1)}%)`);

      optimized++;
      totalSaved += saved;
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  if (optimized > 0) {
    await supabase
      .from('course_lessons')
      .update({
        html_content: htmlContent,
        content: htmlContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', lesson.id);

    console.log(`\n💾 Đã cập nhật database`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ Đã optimize: ${optimized} hình`);
  console.log(`💾 Tiết kiệm: ${formatSize(totalSaved)}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
