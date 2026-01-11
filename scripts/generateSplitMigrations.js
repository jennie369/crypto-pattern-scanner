/**
 * GEM Trading Academy - Generate Split SQL Migrations
 * Creates 3 separate SQL files (one per course) for easier import
 */

const fs = require('fs');
const path = require('path');

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

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

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

function main() {
  console.log('Generating split SQL migrations...\n');

  const projectRoot = path.resolve(__dirname, '..');
  const outputDir = path.join(projectRoot, 'supabase', 'sql_imports');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [tierKey, config] of Object.entries(COURSE_CONFIG)) {
    const folderPath = path.join(projectRoot, config.folderPath);

    if (!fs.existsSync(folderPath)) {
      console.error(`Folder not found: ${folderPath}`);
      continue;
    }

    let sql = `-- =====================================================
-- ${tierKey.toUpperCase()}: ${config.courseId}
-- Generated: ${new Date().toISOString()}
-- =====================================================
-- Paste this into Supabase Dashboard > SQL Editor
-- =====================================================

`;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html')).sort();
    console.log(`${tierKey}: Processing ${files.length} files...`);

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

    let lessonCount = 0;

    // Generate SQL for each chapter
    for (const [chapterNum, lessons] of Object.entries(chapterFiles)) {
      const moduleConfig = config.modules[chapterNum];
      if (!moduleConfig) continue;

      const moduleId = `module-${tierKey}-ch${chapterNum}`;

      // Module UPSERT
      sql += `-- Module: ${moduleConfig.title}
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
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

        sql += `-- Lesson ${parsed.chapter}.${parsed.lesson}
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
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
        lessonCount++;
      }
    }

    // Update course total_lessons
    sql += `-- Update course lesson count
UPDATE courses SET total_lessons = (
  SELECT COUNT(*) FROM course_lessons WHERE course_id = '${config.courseId}'
), updated_at = NOW()
WHERE id = '${config.courseId}';

-- =====================================================
-- DONE: ${lessonCount} lessons imported for ${tierKey}
-- =====================================================
`;

    // Write file
    const outputPath = path.join(outputDir, `import_${tierKey.replace('-', '_')}.sql`);
    fs.writeFileSync(outputPath, sql, 'utf-8');

    const fileSizeMB = (Buffer.byteLength(sql, 'utf-8') / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Created: ${outputPath}`);
    console.log(`      Size: ${fileSizeMB} MB | Lessons: ${lessonCount}`);
  }

  console.log(`\n✅ All files created in: ${outputDir}`);
  console.log(`\nTo import:`);
  console.log(`1. Go to Supabase Dashboard > SQL Editor`);
  console.log(`2. Run each file in order: tier_1 → tier_2 → tier_3`);
}

main();
