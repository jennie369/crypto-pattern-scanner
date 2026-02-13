/**
 * GEM Trading Academy - Generate SQL Migration for Lessons
 * Creates a SQL migration file to import all HTML lessons
 *
 * Usage: node scripts/generateLessonsMigration.js
 */

const fs = require('fs');
const path = require('path');

// Course mapping - using existing course IDs from database
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

// Escape SQL string
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

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
  const match = filename.match(/tier-(\d)-bai-(\d+)\.(\d+)-(.+)\.html/);
  if (!match) return null;

  return {
    tier: parseInt(match[1]),
    chapter: parseInt(match[2]),
    lesson: parseInt(match[3]),
    slug: match[4],
  };
}

function main() {
  console.log('Generating SQL migration for lessons...\n');

  const projectRoot = path.resolve(__dirname, '..');
  const outputPath = path.join(projectRoot, 'supabase', 'migrations', '20260103_import_trading_lessons.sql');

  let sql = `-- =====================================================
-- GEM TRADING ACADEMY - LESSON HTML IMPORT
-- Generated: ${new Date().toISOString()}
-- Total: 124 lessons across 3 courses
-- =====================================================

-- This migration imports all HTML lesson content
-- Run with: npx supabase db push
-- Or paste into Supabase Dashboard > SQL Editor

BEGIN;

`;

  let totalModules = 0;
  let totalLessons = 0;

  for (const [tierKey, config] of Object.entries(COURSE_CONFIG)) {
    const folderPath = path.join(projectRoot, config.folderPath);

    if (!fs.existsSync(folderPath)) {
      console.error(`Folder not found: ${folderPath}`);
      continue;
    }

    sql += `-- =====================================================\n`;
    sql += `-- ${tierKey.toUpperCase()}: ${config.courseId}\n`;
    sql += `-- =====================================================\n\n`;

    // Read all HTML files
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html')).sort();
    console.log(`${tierKey}: Found ${files.length} files`);

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

    // Generate SQL for each chapter
    for (const [chapterNum, lessons] of Object.entries(chapterFiles)) {
      const moduleConfig = config.modules[chapterNum];
      if (!moduleConfig) continue;

      const moduleId = `module-${tierKey}-ch${chapterNum}`;

      // Module UPSERT
      sql += `-- Module: ${moduleConfig.title}\n`;
      sql += `INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  '${moduleId}',
  '${config.courseId}',
  '${escapeSql(moduleConfig.title)}',
  '${escapeSql(moduleConfig.description)}',
  ${chapterNum},
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

`;
      totalModules++;

      // Generate SQL for each lesson
      for (const { file, parsed } of lessons) {
        const filePath = path.join(folderPath, file);
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const lessonId = `lesson-${tierKey}-ch${parsed.chapter}-l${parsed.lesson}`;

        let title = extractTitleFromHTML(htmlContent);
        if (!title) {
          title = parsed.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        const fullTitle = `Bài ${parsed.chapter}.${parsed.lesson}: ${title}`;
        const escapedHtml = escapeSql(htmlContent);

        sql += `-- Lesson ${parsed.chapter}.${parsed.lesson}\n`;
        sql += `INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  '${lessonId}',
  '${moduleId}',
  '${config.courseId}',
  '${escapeSql(fullTitle)}',
  'article',
  '${escapedHtml}',
  '${escapedHtml}',
  ${parsed.lesson},
  15,
  ${parsed.lesson === 1 ? 'true' : 'false'},
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

`;
        totalLessons++;
      }
    }
  }

  // Update course total_lessons counts
  sql += `-- =====================================================
-- UPDATE COURSE LESSON COUNTS
-- =====================================================

UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = 'course-tier1-trading-foundation'
), updated_at = NOW()
WHERE id = 'course-tier1-trading-foundation';

UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = 'course-tier2-trading-advanced'
), updated_at = NOW()
WHERE id = 'course-tier2-trading-advanced';

UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = 'course-tier3-trading-mastery'
), updated_at = NOW()
WHERE id = 'course-tier3-trading-mastery';

COMMIT;

-- =====================================================
-- IMPORT SUMMARY
-- =====================================================
-- Modules created/updated: ${totalModules}
-- Lessons created/updated: ${totalLessons}
--
-- After running this migration:
-- 1. Web and Mobile app will show lessons immediately
-- 2. Real-time sync is automatic via Supabase
-- =====================================================
`;

  // Write to file
  fs.writeFileSync(outputPath, sql, 'utf-8');

  console.log(`\n✅ Migration file created: ${outputPath}`);
  console.log(`   Modules: ${totalModules}`);
  console.log(`   Lessons: ${totalLessons}`);
  console.log(`\nTo run the migration:`);
  console.log(`   npx supabase db push`);
  console.log(`   OR paste SQL into Supabase Dashboard > SQL Editor`);
}

main();
