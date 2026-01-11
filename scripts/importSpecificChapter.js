/**
 * GEM Trading Academy - Import Specific Chapter
 *
 * USAGE:
 *   node scripts/importSpecificChapter.js tier1 4
 *   node scripts/importSpecificChapter.js tier1 3
 *   node scripts/importSpecificChapter.js tier2 1
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const COURSE_CONFIG = {
  'tier1': {
    courseId: 'course-tier1-trading-foundation',
    folderPath: 'Tạo Khóa học/Khóa Trading/Tier-1-Co-ban',
    tierKey: 'tier-1',
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
  'tier2': {
    courseId: 'course-tier2-trading-advanced',
    folderPath: 'Tạo Khóa học/Khóa Trading/Tier-2-Nang-cao',
    tierKey: 'tier-2',
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
  'tier3': {
    courseId: 'course-tier3-trading-mastery',
    folderPath: 'Tạo Khóa học/Khóa Trading/Tier-3-Elite',
    tierKey: 'tier-3',
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

async function importChapter(tier, chapterNum) {
  const config = COURSE_CONFIG[tier];
  if (!config) {
    console.error(`❌ Tier không hợp lệ: ${tier}`);
    console.log('   Các tier hợp lệ: tier1, tier2, tier3');
    return;
  }

  const moduleConfig = config.modules[chapterNum];
  if (!moduleConfig) {
    console.error(`❌ Chương ${chapterNum} không tồn tại trong ${tier}`);
    console.log('   Các chương có sẵn:', Object.keys(config.modules).join(', '));
    return;
  }

  console.log('='.repeat(60));
  console.log(`Import ${tier.toUpperCase()} - Chương ${chapterNum}`);
  console.log('='.repeat(60));
  console.log('');

  const projectRoot = path.resolve(__dirname, '..');
  const folderPath = path.join(projectRoot, config.folderPath);

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder không tồn tại: ${folderPath}`);
    return;
  }

  // Read HTML files for this chapter only
  const files = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.html'))
    .filter(f => {
      const parsed = parseFilename(f);
      return parsed && parsed.chapter === chapterNum;
    })
    .sort();

  if (files.length === 0) {
    console.error(`❌ Không tìm thấy file HTML cho chương ${chapterNum}`);
    return;
  }

  console.log(`📄 Tìm thấy ${files.length} bài học`);
  console.log('');

  const moduleId = `module-${config.tierKey}-ch${chapterNum}`;

  // Upsert module
  const { error: moduleError } = await supabase
    .from('course_modules')
    .upsert({
      id: moduleId,
      course_id: config.courseId,
      title: moduleConfig.title,
      description: moduleConfig.description,
      order_index: chapterNum,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (moduleError) {
    console.error(`❌ Module error: ${moduleError.message}`);
    return;
  }

  console.log(`📁 ${moduleConfig.title}`);

  let imported = 0;
  let errors = 0;

  // Process each lesson
  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) continue;

    const filePath = path.join(folderPath, file);
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const lessonId = `lesson-${config.tierKey}-ch${parsed.chapter}-l${parsed.lesson}`;

    let title = extractTitleFromHTML(htmlContent);
    if (!title) {
      title = parsed.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    const fullTitle = `Bài ${parsed.chapter}.${parsed.lesson}: ${title}`;

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
      console.error(`   ❌ Bài ${parsed.chapter}.${parsed.lesson}: ${lessonError.message}`);
      errors++;
    } else {
      console.log(`   ✅ ${fullTitle}`);
      imported++;
    }
  }

  // Update course total_lessons
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

  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Imported: ${imported} bài học`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total lessons in course: ${count}`);
  console.log('');
  console.log('🔄 Real-time sync: Web + Mobile sẽ hiển thị ngay!');
}

// Main
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('');
  console.log('USAGE:');
  console.log('  node scripts/importSpecificChapter.js <tier> <chapter>');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  node scripts/importSpecificChapter.js tier1 4');
  console.log('  node scripts/importSpecificChapter.js tier1 3');
  console.log('  node scripts/importSpecificChapter.js tier2 1');
  console.log('');
  console.log('TIERS: tier1, tier2, tier3');
  console.log('');
  process.exit(1);
}

const tier = args[0].toLowerCase();
const chapter = parseInt(args[1]);

importChapter(tier, chapter).catch(console.error);
