/**
 * GEM Academy - Import "GEM Trading - Gói Căn Bản" Starter Course
 * Imports 17 HTML lessons
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration with SERVICE ROLE KEY
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Course configuration
const COURSE_NAME = 'GEM Trading - Gói Căn Bản';
const FOLDER_PATH = 'C:/Users/Jennie Chu/Desktop/Projects/crypto-pattern-scanner/Tạo Khóa học/Khóa Trading/Starter-Course';

// Module configuration
const MODULES = {
  1: { title: 'Chapter 1: Khám Phá Con Đường Tự Do Tài Chính', description: 'Hiểu về tự do tài chính và lý do nhiều người thất bại' },
  2: { title: 'Chapter 2: Giới Thiệu Phương Pháp GEM Frequency', description: 'Tìm hiểu phương pháp GEM Frequency độc quyền' },
  3: { title: 'Chapter 3: Trải Nghiệm Công Cụ GEM', description: 'Khám phá Scanner, Chatbot và Community' },
  4: { title: 'Module A: Sự Thật Và Lựa Chọn', description: 'Nhận ra sự thật và đứng trước ngã ba đường' },
  5: { title: 'Module B: Cơ Hội Và Hành Động', description: 'Chi tiết các gói và bước tiếp theo' },
};

function extractTitleFromHTML(htmlContent) {
  const titleMatch = htmlContent.match(/<title>([^|<]+)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  return null;
}

function parseFilename(filename) {
  // Match: starter-bai-1.1-tu-do-tai-chinh.html
  const match = filename.match(/starter-bai-(\d+)\.(\d+)-(.+)\.html/);
  if (!match) return null;
  return {
    chapter: parseInt(match[1]),
    lesson: parseInt(match[2]),
    slug: match[3],
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Import GEM Trading Starter Course');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Find course in database
  console.log('🔍 Tìm khóa học trong database...');
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select('id, title')
    .ilike('title', `%${COURSE_NAME}%`);

  if (courseError) {
    console.error('❌ Lỗi tìm khóa học:', courseError.message);
    return;
  }

  if (!courses || courses.length === 0) {
    console.error('❌ Không tìm thấy khóa học:', COURSE_NAME);
    console.log('');
    console.log('Các khóa học hiện có:');
    const { data: allCourses } = await supabase.from('courses').select('id, title');
    allCourses?.forEach(c => console.log(`   - ${c.id}: ${c.title}`));
    return;
  }

  const course = courses[0];
  console.log(`✅ Tìm thấy: ${course.id}`);
  console.log(`   Title: ${course.title}`);
  console.log('');

  // Step 2: Read HTML files
  const files = fs.readdirSync(FOLDER_PATH)
    .filter(f => f.endsWith('.html'))
    .sort();

  console.log(`📄 Tìm thấy ${files.length} file HTML`);
  console.log('');

  const stats = { modules: 0, lessons: 0, errors: [] };

  // Group files by chapter
  const chapterFiles = {};
  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) continue;
    if (!chapterFiles[parsed.chapter]) {
      chapterFiles[parsed.chapter] = [];
    }
    chapterFiles[parsed.chapter].push({ file, parsed });
  }

  // Step 3: Process each chapter
  for (const [chapterNum, lessons] of Object.entries(chapterFiles)) {
    const moduleConfig = MODULES[chapterNum];
    if (!moduleConfig) {
      console.log(`⚠️  Không có config cho Chapter ${chapterNum}, skip...`);
      continue;
    }

    const moduleId = `module-starter-ch${chapterNum}`;

    // Upsert module
    const { error: moduleError } = await supabase
      .from('course_modules')
      .upsert({
        id: moduleId,
        course_id: course.id,
        title: moduleConfig.title,
        description: moduleConfig.description,
        order_index: parseInt(chapterNum),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (moduleError) {
      console.error(`❌ Module error: ${moduleError.message}`);
      stats.errors.push(`Module ${moduleId}: ${moduleError.message}`);
      continue;
    }

    console.log(`📁 ${moduleConfig.title}`);
    stats.modules++;

    // Process lessons
    for (const { file, parsed } of lessons) {
      const filePath = path.join(FOLDER_PATH, file);
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      const lessonId = `lesson-starter-ch${parsed.chapter}-l${parsed.lesson}`;

      let title = extractTitleFromHTML(htmlContent);
      if (!title) {
        title = `Bài ${parsed.chapter}.${parsed.lesson}`;
      }

      // Upsert lesson
      const { error: lessonError } = await supabase
        .from('course_lessons')
        .upsert({
          id: lessonId,
          module_id: moduleId,
          course_id: course.id,
          title: title,
          type: 'article',
          html_content: htmlContent,
          content: htmlContent,
          order_index: parsed.lesson,
          duration_minutes: 10,
          is_preview: parsed.chapter === 1 && parsed.lesson === 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (lessonError) {
        console.error(`   ❌ Bài ${parsed.chapter}.${parsed.lesson}: ${lessonError.message}`);
        stats.errors.push(`Lesson ${lessonId}: ${lessonError.message}`);
      } else {
        console.log(`   ✅ ${title}`);
        stats.lessons++;
      }
    }
  }

  // Step 4: Update course total_lessons
  const { count } = await supabase
    .from('course_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id);

  await supabase
    .from('courses')
    .update({
      total_lessons: count,
      updated_at: new Date().toISOString()
    })
    .eq('id', course.id);

  console.log('');
  console.log(`📊 Updated total_lessons: ${count}`);

  // Final summary
  console.log('');
  console.log('='.repeat(60));
  console.log('IMPORT COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Modules: ${stats.modules}`);
  console.log(`✅ Lessons: ${stats.lessons}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('\n🔄 Real-time sync: Web + Mobile app sẽ hiển thị ngay lập tức!');
  console.log('='.repeat(60));
}

main().catch(console.error);
