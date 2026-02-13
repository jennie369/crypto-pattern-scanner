const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

const BASE_DIR = path.join(__dirname, 'Khóa Trading');

// ============================================
// TIER DEFINITIONS
// ============================================
const TIERS = {
  'tier-1': {
    courseId: 'course-tier1-trading-foundation',
    tierNum: 1,
    chapters: {
      1: 'Chương 1: Giới Thiệu GEM Frequency Method',
      2: 'Chương 2: Vùng Tần Số Cơ Bản (HFZ & LFZ)',
      3: 'Chương 3: Classic Patterns Cơ Bản - Phần 1',
      4: 'Chương 4: Classic Patterns Cơ Bản - Phần 2',
      5: 'Chương 5: Paper Trading & Backtesting',
      6: 'Chương 6: GEM Master AI Cơ Bản',
      7: 'Chương 7: Hành Trình Chuyển Hóa (Module A)',
      8: 'Chương 8: Cơ Hội & Lựa Chọn (Module B)',
    }
  },
  'tier-2': {
    courseId: 'course-tier2-trading-advanced',
    tierNum: 2,
    chapters: {
      1: 'Chương 1: DPD Pattern Mastery',
      2: 'Chương 2: UPU Pattern Mastery',
      3: 'Chương 3: UPD Pattern - Đảo Chiều Giảm',
      4: 'Chương 4: DPU Pattern - Đảo Chiều Tăng',
      5: 'Chương 5: HFZ Mastery - Vùng Tần Số Cao Chi Tiết',
      6: 'Chương 6: LFZ Mastery - Vùng Tần Số Thấp Chi Tiết',
      7: 'Chương 7: Classic Patterns Nâng Cao',
      8: 'Chương 8: Phân Tích Đa Khung Thời Gian & Quản Lý Rủi Ro',
      9: 'Chương 9: Chấm Điểm Zone & Odds Enhancers',
      10: 'Chương 10: Hành Trình Chuyển Hóa (Module A)',
      11: 'Chương 11: Cơ Hội & Lựa Chọn (Module B)',
    }
  },
  'tier-3': {
    courseId: 'course-tier3-trading-mastery',
    tierNum: 3,
    chapters: {
      1: 'Chương 1: Flag & Pennant Patterns',
      2: 'Chương 2: Wedge Patterns',
      3: 'Chương 3: Candlestick Mastery',
      4: 'Chương 4: Advanced Patterns (Cup & Handle, Three Methods)',
      5: 'Chương 5: AI Signals & Tự Động Hóa',
      6: 'Chương 6: Whale Tracking & Order Flow',
      7: 'Chương 7: Quản Lý Rủi Ro & Danh Mục Nâng Cao',
      8: 'Chương 8: Hành Trình Chuyển Hóa (Module A)',
      9: 'Chương 9: Cơ Hội & Lựa Chọn (Module B)',
    }
  }
};

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/<title>(.*?)<\/title>/i);
  if (!match) return path.basename(filePath, '.html');
  let title = match[1]
    .replace(/ \| GEM Trading Academy/gi, '')
    .replace(/ - GEM Trading Academy/gi, '')
    .replace(/&amp;/g, '&')
    .trim();
  return title;
}

function extractDescriptiveName(htmlTitle) {
  // Remove "Bài X.Y: " or "Bai X.Y: " prefix
  const match = htmlTitle.match(/^Bài?\s*\d+\.\d+:\s*(.+)$/i);
  return match ? match[1].trim() : htmlTitle;
}

function classifyTier2File(filename) {
  // For tier-2 chapter 9 files, distinguish zone scoring vs module A
  const isZoneScoring = filename.includes('-tier-2') ||
                        filename.includes('cham-diem') ||
                        filename.includes('odds-enhancers') ||
                        filename.includes('zone-scoring') ||
                        filename.includes('filter-zones') ||
                        filename.includes('zone-grading');
  const isModuleA = filename.includes('con-nguoi-cu') ||
                    filename.includes('ban-do-hanh-trinh') ||
                    filename.includes('su-thay-doi-thuc-su') ||
                    filename.includes('dieu-khien-ban');
  return { isZoneScoring, isModuleA };
}

function buildLessons() {
  const allLessons = [];

  for (const [tierDir, tierConfig] of Object.entries(TIERS)) {
    const dir = path.join(BASE_DIR, tierDir);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();

    // Group files by chapter
    const chapterFiles = {};

    for (const file of files) {
      const match = file.match(/bai-(\d+)\.(\d+)/);
      if (!match) continue;

      let chapterNum = parseInt(match[1]);
      const lessonNum = parseInt(match[2]);

      // Special handling for tier-2 chapter 9 duplicates
      if (tierDir === 'tier-2' && chapterNum === 9) {
        const { isZoneScoring, isModuleA } = classifyTier2File(file);
        if (isZoneScoring) {
          chapterNum = 9; // Zone scoring -> Chapter 9
        } else if (isModuleA) {
          chapterNum = 10; // Module A -> Chapter 10
        }
      }

      // Tier-2 chapter 10 files -> Chapter 11 (Module B)
      if (tierDir === 'tier-2' && parseInt(match[1]) === 10) {
        chapterNum = 11;
      }

      if (!chapterFiles[chapterNum]) chapterFiles[chapterNum] = [];
      chapterFiles[chapterNum].push({ file, originalChapter: parseInt(match[1]), lessonNum });
    }

    // Process each chapter
    for (const [chapterNum, lessons] of Object.entries(chapterFiles)) {
      const ch = parseInt(chapterNum);
      const moduleId = `mod-t${tierConfig.tierNum}-ch${ch}`;

      // Sort lessons by lesson number
      lessons.sort((a, b) => a.lessonNum - b.lessonNum);

      lessons.forEach((lesson, idx) => {
        const filePath = path.join(dir, lesson.file);
        const htmlTitle = extractTitle(filePath);
        const descriptiveName = extractDescriptiveName(htmlTitle);
        const htmlContent = fs.readFileSync(filePath, 'utf8');

        // Build normalized lesson title: "Bài X.Y: Descriptive Name"
        const lessonTitle = `Bài ${ch}.${lesson.lessonNum}: ${descriptiveName}`;
        const lessonId = `les-t${tierConfig.tierNum}-${ch}.${lesson.lessonNum}`;

        allLessons.push({
          id: lessonId,
          module_id: moduleId,
          course_id: tierConfig.courseId,
          title: lessonTitle,
          html_content: htmlContent,
          order_index: idx,
          type: 'article',
          content_type: 'html',
          is_preview: false,
          is_free_preview: false,
          tier: tierConfig.tierNum,
          chapter: ch,
          file: lesson.file
        });
      });
    }
  }

  return allLessons;
}

async function insertBatch(lessons) {
  const records = lessons.map(l => ({
    id: l.id,
    module_id: l.module_id,
    course_id: l.course_id,
    title: l.title,
    html_content: l.html_content,
    order_index: l.order_index,
    type: l.type,
    content_type: l.content_type,
    is_preview: l.is_preview,
    is_free_preview: l.is_free_preview,
  }));

  const response = await fetch(`${SUPABASE_URL}/rest/v1/course_lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(records)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.status;
}

async function main() {
  console.log('Building lesson data from HTML files...');
  const lessons = buildLessons();

  // Summary
  const tierCounts = {};
  for (const l of lessons) {
    const key = `Tier ${l.tier}`;
    if (!tierCounts[key]) tierCounts[key] = { chapters: new Set(), lessons: 0 };
    tierCounts[key].chapters.add(l.chapter);
    tierCounts[key].lessons++;
  }

  console.log('\n=== SUMMARY ===');
  for (const [tier, counts] of Object.entries(tierCounts)) {
    console.log(`${tier}: ${counts.chapters.size} chapters, ${counts.lessons} lessons`);
  }
  console.log(`Total: ${lessons.length} lessons\n`);

  // Print chapter breakdown
  for (const l of lessons) {
    if (l.order_index === 0) {
      const chapterLessons = lessons.filter(x => x.module_id === l.module_id);
      console.log(`  [T${l.tier}] ${l.module_id}: ${chapterLessons.length} lessons`);
    }
  }

  // Insert in batches of 3 (each ~35KB, batch ~105KB)
  const BATCH_SIZE = 3;
  let inserted = 0;
  let errors = 0;

  console.log(`\nInserting ${lessons.length} lessons in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < lessons.length; i += BATCH_SIZE) {
    const batch = lessons.slice(i, i + BATCH_SIZE);
    try {
      await insertBatch(batch);
      inserted += batch.length;
      process.stdout.write(`  Inserted ${inserted}/${lessons.length}\r`);
    } catch (err) {
      console.error(`\n  ERROR at batch ${Math.floor(i/BATCH_SIZE)+1}: ${err.message}`);
      // Try one by one
      for (const lesson of batch) {
        try {
          await insertBatch([lesson]);
          inserted++;
        } catch (err2) {
          console.error(`  FAILED: ${lesson.id} - ${err2.message}`);
          errors++;
        }
      }
    }
  }

  console.log(`\n\n=== DONE ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
