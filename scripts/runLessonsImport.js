/**
 * GEM Trading Academy - Auto Import Lessons with Service Role Key
 * Bypasses RLS to import all 124 lessons directly
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration with SERVICE ROLE KEY (bypasses RLS)
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Course mapping
const COURSE_CONFIG = {
  'tier-1': {
    courseId: 'course-tier1-trading-foundation',
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
    courseId: 'course-tier2-trading-advanced',
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
    courseId: 'course-tier3-trading-mastery',
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

function extractTitleFromHTML(htmlContent) {
  const titleMatch = htmlContent.match(/<title>([^|<]+)/);
  if (titleMatch) {
    return titleMatch[1].trim().replace(/^Bài \d+\.\d+:\s*/, '');
  }
  return null;
}

function parseFilename(filename) {
  const match = filename.match(/tier-(\d)-bai-(\d+)\.(\d+)-(.+)\.html/);
  if (!match) return null;
  return {
    tier: parseInt(match[1]),
    chapter: parseInt(match[2]),
    lesson: parseInt(match[3]),
    slug: match[4],
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Trading Academy - Auto Import with Service Role Key');
  console.log('='.repeat(60));
  console.log('');

  const projectRoot = path.resolve(__dirname, '..');
  const stats = { modules: 0, lessons: 0, errors: [] };

  for (const [tierKey, config] of Object.entries(COURSE_CONFIG)) {
    console.log(`\n📚 ${config.courseId}`);
    console.log('-'.repeat(50));

    const folderPath = path.join(projectRoot, config.folderPath);

    if (!fs.existsSync(folderPath)) {
      console.error(`   ❌ Folder not found: ${folderPath}`);
      stats.errors.push(`Folder not found: ${folderPath}`);
      continue;
    }

    // Read all HTML files
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html')).sort();
    console.log(`   📄 Found ${files.length} HTML files`);

    // Group by chapter
    const chapterFiles = {};
    for (const file of files) {
      const parsed = parseFilename(file);
      if (!parsed) continue;
      if (!chapterFiles[parsed.chapter]) {
        chapterFiles[parsed.chapter] = [];
      }
      chapterFiles[parsed.chapter].push({ file, parsed });
    }

    // Process each chapter
    for (const [chapterNum, lessons] of Object.entries(chapterFiles)) {
      const moduleConfig = config.modules[chapterNum];
      if (!moduleConfig) continue;

      const moduleId = `module-${tierKey}-ch${chapterNum}`;

      // Upsert module
      const { error: moduleError } = await supabase
        .from('course_modules')
        .upsert({
          id: moduleId,
          course_id: config.courseId,
          title: moduleConfig.title,
          description: moduleConfig.description,
          order_index: parseInt(chapterNum),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (moduleError) {
        console.error(`   ❌ Module error: ${moduleError.message}`);
        stats.errors.push(`Module ${moduleId}: ${moduleError.message}`);
        continue;
      }

      console.log(`   📁 ${moduleConfig.title}`);
      stats.modules++;

      // Process lessons in this chapter
      for (const { file, parsed } of lessons) {
        const filePath = path.join(folderPath, file);
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const lessonId = `lesson-${tierKey}-ch${parsed.chapter}-l${parsed.lesson}`;

        let title = extractTitleFromHTML(htmlContent);
        if (!title) {
          title = parsed.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        const fullTitle = `Bài ${parsed.chapter}.${parsed.lesson}: ${title}`;

        // Upsert lesson
        const { error: lessonError } = await supabase
          .from('course_lessons')
          .upsert({
            id: lessonId,
            module_id: moduleId,
            course_id: config.courseId,
            title: fullTitle,
            type: 'article',
            html_content: htmlContent,
            content: htmlContent,
            order_index: parsed.lesson,
            duration_minutes: 15,
            is_preview: parsed.lesson === 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (lessonError) {
          console.error(`      ❌ Lesson ${parsed.chapter}.${parsed.lesson}: ${lessonError.message}`);
          stats.errors.push(`Lesson ${lessonId}: ${lessonError.message}`);
        } else {
          process.stdout.write(`      ✅ Bài ${parsed.chapter}.${parsed.lesson}\n`);
          stats.lessons++;
        }
      }
    }

    // Update course total_lessons count
    const { count } = await supabase
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', config.courseId);

    await supabase
      .from('courses')
      .update({
        total_lessons: count,
        updated_at: new Date().toISOString()
      })
      .eq('id', config.courseId);

    console.log(`   📊 Updated total_lessons: ${count}`);
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Modules: ${stats.modules}`);
  console.log(`✅ Lessons: ${stats.lessons}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  }

  console.log('\n🔄 Real-time sync: Web + Mobile app sẽ hiển thị ngay lập tức!');
  console.log('='.repeat(60));
}

main().catch(console.error);
