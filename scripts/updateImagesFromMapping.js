/**
 * GEM Academy - Update Images from Mapping File
 * Đọc file JSON mapping và update hình ảnh vào các file HTML
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Lesson ID mapping
const LESSON_ID_MAP = {
  'lesson_3.1': 'lesson-tier-1-ch3-l1',
  'lesson_3.2': 'lesson-tier-1-ch3-l2',
  'lesson_3.3': 'lesson-tier-1-ch3-l3',
  'lesson_3.4': 'lesson-tier-1-ch3-l4',
  'lesson_3.5': 'lesson-tier-1-ch3-l5',
  'lesson_3.6': 'lesson-tier-1-ch3-l6',
  'lesson_4.1': 'lesson-tier-1-ch4-l1',
  'lesson_4.2': 'lesson-tier-1-ch4-l2',
  'lesson_4.3': 'lesson-tier-1-ch4-l3',
  'lesson_4.4': 'lesson-tier-1-ch4-l4',
  'lesson_4.5': 'lesson-tier-1-ch4-l5',
  'lesson_4.6': 'lesson-tier-1-ch4-l6',
};

function generateImageHTML(imageUrl, description, index) {
  return `
    <div class="image-container" style="margin: 24px 0; text-align: center;">
      <img
        src="${imageUrl}"
        alt="${description}"
        style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
        loading="lazy"
      />
      <p style="margin-top: 8px; font-size: 14px; color: rgba(255,255,255,0.7); font-style: italic;">
        Hình ${index}: ${description}
      </p>
    </div>`;
}

async function updateLessonImages(lessonId, images) {
  // Get current lesson content
  const { data: lesson, error: fetchError } = await supabase
    .from('course_lessons')
    .select('html_content')
    .eq('id', lessonId)
    .single();

  if (fetchError || !lesson) {
    console.error(`   ❌ Không tìm thấy lesson: ${lessonId}`);
    return false;
  }

  let htmlContent = lesson.html_content;

  // Find all sections in the HTML and insert images
  // Strategy: Insert images after <h2> or <h3> headings, or after specific markers

  // Collect valid images
  const validImages = [];
  for (let i = 1; i <= 5; i++) {
    const img = images[`image_${i}`];
    if (img && img.url && img.url.trim() !== '') {
      validImages.push({
        index: i,
        url: img.url.trim(),
        description: img.description || `Hình minh họa ${i}`
      });
    }
  }

  if (validImages.length === 0) {
    console.log(`   ⚠️  Không có hình ảnh để update`);
    return false;
  }

  // Find insertion points - look for section markers or headings
  // Insert images after <!-- IMAGE_X --> markers if they exist
  // Otherwise, distribute images after <h2> or <h3> tags

  let updatedContent = htmlContent;

  // Method 1: Check for existing image placeholders
  let hasPlaceholders = false;
  for (const img of validImages) {
    const placeholder = `<!-- IMAGE_${img.index} -->`;
    if (updatedContent.includes(placeholder)) {
      hasPlaceholders = true;
      const imageHTML = generateImageHTML(img.url, img.description, img.index);
      updatedContent = updatedContent.replace(placeholder, placeholder + imageHTML);
    }
  }

  // Method 2: If no placeholders, insert after sections
  if (!hasPlaceholders) {
    // Find all <section> or heading tags
    const sectionRegex = /<section[^>]*class="[^"]*section[^"]*"[^>]*>/gi;
    const sections = [...updatedContent.matchAll(sectionRegex)];

    if (sections.length >= validImages.length) {
      // Insert one image per section (after the section opening tag)
      let offset = 0;
      for (let i = 0; i < validImages.length && i < sections.length; i++) {
        const section = sections[i];
        const insertPos = section.index + section[0].length + offset;
        const imageHTML = generateImageHTML(validImages[i].url, validImages[i].description, validImages[i].index);
        updatedContent = updatedContent.slice(0, insertPos) + imageHTML + updatedContent.slice(insertPos);
        offset += imageHTML.length;
      }
    } else {
      // Fallback: Insert all images after the first <main> or <article> tag
      const mainMatch = updatedContent.match(/<main[^>]*>|<article[^>]*>/i);
      if (mainMatch) {
        const insertPos = mainMatch.index + mainMatch[0].length;
        let allImagesHTML = '';
        for (const img of validImages) {
          allImagesHTML += generateImageHTML(img.url, img.description, img.index);
        }
        updatedContent = updatedContent.slice(0, insertPos) + allImagesHTML + updatedContent.slice(insertPos);
      }
    }
  }

  // Update database
  const { error: updateError } = await supabase
    .from('course_lessons')
    .update({
      html_content: updatedContent,
      content: updatedContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId);

  if (updateError) {
    console.error(`   ❌ Lỗi update: ${updateError.message}`);
    return false;
  }

  return true;
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Update Images from Mapping');
  console.log('='.repeat(60));
  console.log('');

  // Read mapping file
  const mappingPath = path.join(__dirname, 'image-mapping-tier1-ch3-ch4.json');

  if (!fs.existsSync(mappingPath)) {
    console.error('❌ Không tìm thấy file mapping:', mappingPath);
    console.log('');
    console.log('Hãy tạo file image-mapping-tier1-ch3-ch4.json trước!');
    return;
  }

  const mappingContent = fs.readFileSync(mappingPath, 'utf-8');
  const mapping = JSON.parse(mappingContent);

  let updated = 0;
  let skipped = 0;

  // Process Chapter 3
  console.log('📁 Chapter 3: UPU Pattern');
  console.log('-'.repeat(50));

  if (mapping.chapter_3_UPU_Pattern) {
    for (const [lessonKey, lessonData] of Object.entries(mapping.chapter_3_UPU_Pattern)) {
      const lessonId = LESSON_ID_MAP[lessonKey];
      if (!lessonId) continue;

      console.log(`   📄 ${lessonData.title}`);

      // Check if any images have URLs
      const hasImages = Object.values(lessonData.images || {}).some(img => img.url && img.url.trim() !== '');

      if (!hasImages) {
        console.log(`      ⏭️  Chưa có URL hình ảnh, skip`);
        skipped++;
        continue;
      }

      const success = await updateLessonImages(lessonId, lessonData.images);
      if (success) {
        const imageCount = Object.values(lessonData.images).filter(img => img.url && img.url.trim() !== '').length;
        console.log(`      ✅ Đã thêm ${imageCount} hình ảnh`);
        updated++;
      } else {
        skipped++;
      }
    }
  }

  // Process Chapter 4
  console.log('');
  console.log('📁 Chapter 4: UPD Pattern');
  console.log('-'.repeat(50));

  if (mapping.chapter_4_UPD_Pattern) {
    for (const [lessonKey, lessonData] of Object.entries(mapping.chapter_4_UPD_Pattern)) {
      const lessonId = LESSON_ID_MAP[lessonKey];
      if (!lessonId) continue;

      console.log(`   📄 ${lessonData.title}`);

      // Check if any images have URLs
      const hasImages = Object.values(lessonData.images || {}).some(img => img.url && img.url.trim() !== '');

      if (!hasImages) {
        console.log(`      ⏭️  Chưa có URL hình ảnh, skip`);
        skipped++;
        continue;
      }

      const success = await updateLessonImages(lessonId, lessonData.images);
      if (success) {
        const imageCount = Object.values(lessonData.images).filter(img => img.url && img.url.trim() !== '').length;
        console.log(`      ✅ Đã thêm ${imageCount} hình ảnh`);
        updated++;
      } else {
        skipped++;
      }
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('UPDATE COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updated} lessons`);
  console.log(`⏭️  Skipped: ${skipped} lessons (chưa có URL)`);
  console.log('');
  console.log('🔄 Real-time sync: Web + Mobile app sẽ hiển thị ngay lập tức!');
  console.log('='.repeat(60));
}

main().catch(console.error);
