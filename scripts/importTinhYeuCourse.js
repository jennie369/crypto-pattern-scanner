/**
 * GEM Academy - Import "Kích Hoạt Tần Số Tình Yêu" Course
 * Imports 24 HTML lessons
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration with SERVICE ROLE KEY
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Course configuration
const COURSE_NAME = 'Kích Hoạt Tần Số Tình Yêu';
const FOLDER_PATH = 'C:/Users/Jennie Chu/Desktop/Projects/crypto-pattern-scanner/Tạo Khóa học/Khóa Tần Số Tình Yêu/Khoa_Tinh_Yeu';

// Module configuration
const MODULES = {
  0: { title: 'Module 0: Khởi Đầu', description: 'Chào mừng và đánh giá tần số tình yêu hiện tại' },
  1: { title: 'Module 1: Chữa Lành', description: 'Chữa lành vết thương quá khứ và inner child' },
  2: { title: 'Module 2: Yêu Bản Thân', description: 'Xây dựng tình yêu bản thân vững chắc' },
  3: { title: 'Module 3: Nâng Tần Số', description: 'Nâng cao tần số rung động tình yêu' },
  4: { title: 'Module 4: Sẵn Sàng Tri Kỷ', description: 'Chuẩn bị đón nhận tình yêu đích thực' },
  5: { title: 'Module 5: Nghệ Thuật Quan Hệ', description: 'Kỹ năng giao tiếp và xây dựng mối quan hệ' },
  6: { title: 'Module 6: Sứ Giả Tình Yêu', description: 'Con đường và cơ hội phát triển' },
};

function extractTitleFromHTML(htmlContent) {
  const titleMatch = htmlContent.match(/<title>([^|<]+)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  return null;
}

function parseFilename(filename) {
  // Match: M0_Bai_0.1_Chao_Mung_Hanh_Trinh.html or M1_Bai_1.1_Ban_Do_Quan_He_Qua_Khu.html
  const match = filename.match(/M(\d+)_Bai_(\d+)\.(\d+)_(.+)\.html/);
  if (!match) return null;
  return {
    module: parseInt(match[1]),
    lessonNum: parseInt(match[3]),
    slug: match[4],
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Import Kích Hoạt Tần Số Tình Yêu');
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

  // Group files by module
  const moduleFiles = {};
  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) continue;
    if (!moduleFiles[parsed.module]) {
      moduleFiles[parsed.module] = [];
    }
    moduleFiles[parsed.module].push({ file, parsed });
  }

  // Step 3: Process each module
  for (const [moduleNum, lessons] of Object.entries(moduleFiles)) {
    const moduleConfig = MODULES[moduleNum];
    if (!moduleConfig) {
      console.log(`⚠️  Không có config cho Module ${moduleNum}, skip...`);
      continue;
    }

    const moduleId = `module-tinhyeu-m${moduleNum}`;

    // Upsert module
    const { error: moduleError } = await supabase
      .from('course_modules')
      .upsert({
        id: moduleId,
        course_id: course.id,
        title: moduleConfig.title,
        description: moduleConfig.description,
        order_index: parseInt(moduleNum),
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
      const lessonId = `lesson-tinhyeu-m${parsed.module}-l${parsed.lessonNum}`;

      let title = extractTitleFromHTML(htmlContent);
      if (!title) {
        title = `Bài ${parsed.module}.${parsed.lessonNum}`;
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
          order_index: parsed.lessonNum,
          duration_minutes: 15,
          is_preview: parsed.lessonNum === 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (lessonError) {
        console.error(`   ❌ Bài ${parsed.module}.${parsed.lessonNum}: ${lessonError.message}`);
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
