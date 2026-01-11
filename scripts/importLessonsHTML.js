/**
 * GEM Trading Academy - Lesson HTML Import Script
 * Imports all HTML lesson files into Supabase database
 *
 * Usage: node scripts/importLessonsHTML.js
 *
 * This script will:
 * 1. Read all HTML files from Tier-1, Tier-2, Tier-3 folders
 * 2. Create/update modules for each chapter
 * 3. Create/update lessons with HTML content
 * 4. Real-time sync to both web and mobile app
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Course mapping
const COURSE_CONFIG = {
  'tier-1': {
    courseName: 'GEM Trading - Gói 1: NỀN TẢNG TRADER CHUYÊN NGHIỆP',
    tierRequired: 'TIER1',
    folderPath: 'Tạo Khóa học/Khóa Trading/Tier-1-Co-ban',
    modules: {
      3: { title: 'Chương 3: UPU Pattern Mastery', description: 'Học cách xác định và giao dịch với UPU Pattern' },
      4: { title: 'Chương 4: UPD Pattern', description: 'Hiểu về UPD Pattern và ứng dụng' },
      5: { title: 'Chương 5: DPU Pattern', description: 'Master DPU Pattern trong trading' },
      6: { title: 'Chương 6: Classic Patterns', description: 'Các mẫu hình kỹ thuật cổ điển' },
      7: { title: 'Chương 7: Paper Trading', description: 'Thực hành giao dịch giả lập' },
      8: { title: 'Chương 8: GEM Master AI', description: 'Sử dụng AI trong trading' },
      9: { title: 'Module A: Transformation', description: 'Chuyển đổi tư duy trader' },
      10: { title: 'Module B: Opportunities', description: 'Cơ hội phát triển' },
    }
  },
  'tier-2': {
    courseName: 'GEM Trading - Gói 2: TẦN SỐ TRADER THỊNH VƯỢNG',
    tierRequired: 'TIER2',
    folderPath: 'Tạo Khóa học/Khóa Trading/Tier-2-Nang-cao',
    modules: {
      1: { title: 'Chương 1: HFZ - High Frequency Zones', description: 'Vùng kháng cự chất lượng cao' },
      2: { title: 'Chương 2: LFZ - Low Frequency Zones', description: 'Vùng hỗ trợ chất lượng cao' },
      3: { title: 'Chương 3: Advanced Triangles', description: 'Mẫu hình tam giác nâng cao' },
      4: { title: 'Chương 4: Multi-Timeframe Analysis', description: 'Phân tích đa khung thời gian' },
      5: { title: 'Chương 5: Zone Grading System', description: 'Hệ thống chấm điểm zones' },
      6: { title: 'Chương 6: Risk Management Nâng Cao', description: 'Quản lý rủi ro chuyên sâu' },
      7: { title: 'Module A: Transformation Tier 2', description: 'Chuyển đổi tư duy nâng cao' },
      8: { title: 'Module B: Opportunities Tier 2', description: 'Cơ hội partnership' },
    }
  },
  'tier-3': {
    courseName: 'GEM Trading - Gói 3: ĐẾ CHẾ TRADER BẬC THẦY',
    tierRequired: 'TIER3',
    folderPath: 'Tạo Khóa học/Khóa Trading/Tier-3-Elite',
    modules: {
      1: { title: 'Chương 1: Flag & Pennant Mastery', description: 'Master các mẫu hình Flag và Pennant' },
      2: { title: 'Chương 2: Candlestick Patterns Elite', description: 'Mẫu hình nến chuyên sâu' },
      3: { title: 'Chương 3: AI Signals Integration', description: 'Tích hợp tín hiệu AI' },
      4: { title: 'Chương 4: Whale Tracking', description: 'Theo dõi cá voi' },
      5: { title: 'Chương 5: Risk Management Elite', description: 'Quản lý rủi ro bậc thầy' },
      6: { title: 'Module A: Transformation Elite', description: 'Chuyển đổi tư duy Elite' },
      7: { title: 'Module B: Opportunities Elite', description: 'Cơ hội Elite Partnership' },
    }
  }
};

// Extract title from HTML file
function extractTitleFromHTML(htmlContent) {
  const titleMatch = htmlContent.match(/<title>([^|<]+)/);
  if (titleMatch) {
    return titleMatch[1].trim().replace(/^Bài \d+\.\d+:\s*/, '');
  }
  return null;
}

// Parse filename to get chapter and lesson info
function parseFilename(filename) {
  // Format: tier-X-bai-Y.Z-slug.html
  const match = filename.match(/tier-(\d)-bai-(\d+)\.(\d+)-(.+)\.html/);
  if (!match) return null;

  return {
    tier: parseInt(match[1]),
    chapter: parseInt(match[2]),
    lesson: parseInt(match[3]),
    slug: match[4],
  };
}

// Generate unique ID
function generateId(prefix, tier, chapter, lesson) {
  return `${prefix}-tier${tier}-ch${chapter}-l${lesson}`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Trading Academy - Lesson HTML Import Script');
  console.log('='.repeat(60));
  console.log('');

  const projectRoot = path.resolve(__dirname, '..');
  const stats = { courses: 0, modules: 0, lessons: 0, errors: [] };

  for (const [tierKey, config] of Object.entries(COURSE_CONFIG)) {
    console.log(`\n📚 Processing ${config.courseName}...`);

    const folderPath = path.join(projectRoot, config.folderPath);

    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
      console.error(`   ❌ Folder not found: ${folderPath}`);
      stats.errors.push(`Folder not found: ${folderPath}`);
      continue;
    }

    // Step 1: Find or create course
    let { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('title', config.courseName)
      .single();

    if (courseError && courseError.code !== 'PGRST116') {
      console.error(`   ❌ Error finding course: ${courseError.message}`);

      // Try to create the course
      const { data: newCourse, error: createError } = await supabase
        .from('courses')
        .insert({
          id: `course-${tierKey}`,
          title: config.courseName,
          description: `Khóa học trading ${config.tierRequired}`,
          tier_required: config.tierRequired,
          is_published: true,
          total_lessons: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error(`   ❌ Error creating course: ${createError.message}`);
        stats.errors.push(`Failed to create course: ${config.courseName}`);
        continue;
      }
      course = newCourse;
      console.log(`   ✅ Created course: ${config.courseName}`);
      stats.courses++;
    } else if (course) {
      console.log(`   ✓ Found existing course: ${course.id}`);
    }

    const courseId = course?.id || `course-${tierKey}`;

    // Step 2: Read all HTML files
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html')).sort();
    console.log(`   📄 Found ${files.length} HTML files`);

    // Group files by chapter
    const chapterFiles = {};
    for (const file of files) {
      const parsed = parseFilename(file);
      if (!parsed) {
        console.log(`   ⚠️ Skipping invalid filename: ${file}`);
        continue;
      }

      if (!chapterFiles[parsed.chapter]) {
        chapterFiles[parsed.chapter] = [];
      }
      chapterFiles[parsed.chapter].push({ file, parsed });
    }

    // Step 3: Process each chapter
    for (const [chapterNum, lessons] of Object.entries(chapterFiles)) {
      const moduleConfig = config.modules[chapterNum];
      if (!moduleConfig) {
        console.log(`   ⚠️ No module config for chapter ${chapterNum}`);
        continue;
      }

      const moduleId = `module-${tierKey}-ch${chapterNum}`;

      // Create or update module
      const { data: existingModule } = await supabase
        .from('course_modules')
        .select('id')
        .eq('id', moduleId)
        .single();

      if (!existingModule) {
        const { error: moduleError } = await supabase
          .from('course_modules')
          .insert({
            id: moduleId,
            course_id: courseId,
            title: moduleConfig.title,
            description: moduleConfig.description,
            order_index: parseInt(chapterNum),
          });

        if (moduleError) {
          console.error(`   ❌ Error creating module: ${moduleError.message}`);
          stats.errors.push(`Failed to create module: ${moduleId}`);
          continue;
        }
        console.log(`   📁 Created module: ${moduleConfig.title}`);
        stats.modules++;
      } else {
        console.log(`   ✓ Module exists: ${moduleConfig.title}`);
      }

      // Step 4: Process each lesson in chapter
      for (const { file, parsed } of lessons) {
        const filePath = path.join(folderPath, file);
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const lessonId = generateId('lesson', parsed.tier, parsed.chapter, parsed.lesson);

        // Extract title from HTML
        let title = extractTitleFromHTML(htmlContent);
        if (!title) {
          title = parsed.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        // Create or update lesson
        const lessonData = {
          id: lessonId,
          module_id: moduleId,
          course_id: courseId,
          title: `Bài ${parsed.chapter}.${parsed.lesson}: ${title}`,
          type: 'article',
          html_content: htmlContent,
          content: htmlContent,
          order_index: parsed.lesson,
          duration_minutes: 15, // Default estimate
          is_preview: parsed.lesson === 1, // First lesson of each chapter is preview
        };

        const { data: existingLesson } = await supabase
          .from('course_lessons')
          .select('id')
          .eq('id', lessonId)
          .single();

        if (existingLesson) {
          // Update existing lesson
          const { error: updateError } = await supabase
            .from('course_lessons')
            .update({
              html_content: htmlContent,
              content: htmlContent,
              title: lessonData.title,
              updated_at: new Date().toISOString(),
            })
            .eq('id', lessonId);

          if (updateError) {
            console.error(`      ❌ Error updating lesson: ${updateError.message}`);
            stats.errors.push(`Failed to update: ${lessonId}`);
          } else {
            console.log(`      🔄 Updated: Bài ${parsed.chapter}.${parsed.lesson}`);
            stats.lessons++;
          }
        } else {
          // Insert new lesson
          const { error: insertError } = await supabase
            .from('course_lessons')
            .insert(lessonData);

          if (insertError) {
            console.error(`      ❌ Error creating lesson: ${insertError.message}`);
            stats.errors.push(`Failed to create: ${lessonId}`);
          } else {
            console.log(`      ✅ Created: Bài ${parsed.chapter}.${parsed.lesson}`);
            stats.lessons++;
          }
        }
      }
    }

    // Update course total_lessons count
    const { count } = await supabase
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId);

    await supabase
      .from('courses')
      .update({ total_lessons: count, updated_at: new Date().toISOString() })
      .eq('id', courseId);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`📚 Courses created/found: ${stats.courses}`);
  console.log(`📁 Modules created: ${stats.modules}`);
  console.log(`📄 Lessons imported: ${stats.lessons}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log('\n✅ All imports completed successfully!');
  }

  console.log('\n🔄 Changes will sync to web and mobile app in real-time.');
  console.log('='.repeat(60));
}

main().catch(console.error);
