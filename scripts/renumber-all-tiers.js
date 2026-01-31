/**
 * GEM Academy - Renumber All Tiers
 * Script để đánh số lại các file theo cấu trúc outline mới
 *
 * TIER 1 Changes:
 * - Giữ Ch1 (Giới thiệu)
 * - Thêm Ch2 (Vùng Tần Số Cơ Bản) - ĐÃ TẠO MỚI
 * - Ch2 cũ (Classic Patterns) → Ch3
 * - Thêm Ch4 (Classic Patterns Phần 2) - ĐÃ TẠO MỚI
 * - Ch3 cũ (Paper Trading) → Ch5
 * - Ch4 cũ (GEM Master AI) → Ch6
 * - Thêm Ch7 (Module A) - ĐÃ TẠO MỚI
 * - Thêm Ch8 (Module B) - ĐÃ TẠO MỚI
 *
 * TIER 2 Changes:
 * - Giữ Ch1-6 (DPD, UPU, UPD, DPU, HFZ, LFZ)
 * - Thêm Ch7.1-7.3 (Doji, Rounding) - ĐÃ TẠO MỚI
 * - Ch7 cũ (Triangle) → Ch7.4-7.8
 * - Gộp Ch8-10 → Ch8 (Multi-TF & Risk)
 * - Ch11 cũ (Module A) → Ch9
 * - Ch12 cũ (Module B) → Ch10
 *
 * TIER 3 Changes:
 * - Giữ Ch1 (Flag & Pennant)
 * - Thêm Ch2 (Wedge) - ĐÃ TẠO MỚI
 * - Ch2 cũ (Candlestick) → Ch3
 * - Thêm Ch4 (Advanced Patterns) - ĐÃ TẠO MỚI
 * - Ch3 cũ (AI Signals) → Ch5
 * - Ch4 cũ (Whale) → Ch6
 * - Ch5 cũ (Portfolio) → Ch7
 * - Ch6 cũ (Module A) → Ch8
 * - Ch7 cũ (Module B) → Ch9
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tier1Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-1');
const tier2Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-2');
const tier3Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-3');

// Helper function to rename file and update content
function renumberFile(filePath, oldChapter, oldLesson, newChapter, newLesson, tier) {
  const filename = path.basename(filePath);
  const dir = path.dirname(filePath);

  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update badge in content
  const badgePatterns = [
    new RegExp(`📚 TIER ${tier} • Chương ${oldChapter} • Bài ${oldChapter}\\.${oldLesson}`, 'g'),
    new RegExp(`📚 TIER ${tier} • Chapter ${oldChapter} • Bài ${oldChapter}\\.${oldLesson}`, 'g'),
    new RegExp(`TIER ${tier} • Chương ${oldChapter} • Bài ${oldChapter}\\.${oldLesson}`, 'g'),
  ];

  const newBadge = `📚 TIER ${tier} • Chương ${newChapter} • Bài ${newChapter}.${newLesson}`;

  for (const pattern of badgePatterns) {
    content = content.replace(pattern, newBadge);
  }

  // Update title tag
  content = content.replace(
    new RegExp(`<title>Bài ${oldChapter}\\.${oldLesson}:`, 'g'),
    `<title>Bài ${newChapter}.${newLesson}:`
  );

  // Create new filename
  const slugMatch = filename.match(/tier-\d-bai-\d+\.\d+-(.+)\.html/);
  const slug = slugMatch ? slugMatch[1] : 'lesson';
  const newFilename = `tier-${tier}-bai-${newChapter}.${newLesson}-${slug}.html`;
  const newPath = path.join(dir, newFilename);

  // Write updated content to new path
  fs.writeFileSync(newPath, content, 'utf-8');

  // Delete old file if different
  if (filePath !== newPath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return { old: filename, new: newFilename };
}

// TIER 1 Renumbering
function renumberTier1() {
  console.log('\n=== TIER 1 Renumbering ===\n');

  // Get all tier-1 files
  const files = fs.readdirSync(tier1Dir)
    .filter(f => f.endsWith('.html') && f.startsWith('tier-1-bai-'))
    .sort();

  const renameMap = [];

  for (const filename of files) {
    const match = filename.match(/tier-1-bai-(\d+)\.(\d+)-/);
    if (!match) continue;

    const oldCh = parseInt(match[1]);
    const oldLesson = parseInt(match[2]);
    let newCh = oldCh;
    let newLesson = oldLesson;

    // Mapping rules
    if (oldCh === 2) {
      // Check if this is the NEW Ch2 (Vùng Tần Số) or OLD Ch2 (Classic Patterns)
      if (filename.includes('hfz-la-gi') || filename.includes('lfz-la-gi') ||
          filename.includes('nhan-dien-zone') || filename.includes('nguyen-tac-giao-dich') ||
          filename.includes('gioi-han-tier-1')) {
        // This is NEW Ch2 - keep as is
        newCh = 2;
      } else {
        // This is OLD Ch2 (Classic Patterns) → Ch3
        newCh = 3;
      }
    } else if (oldCh === 3) {
      // Old Ch3 (Paper Trading) → Ch5
      newCh = 5;
    } else if (oldCh === 4) {
      // Check if this is NEW Ch4 (Classic Part 2) or OLD Ch4 (GEM Master AI)
      if (filename.includes('shooting-star') || filename.includes('hanging-man') ||
          filename.includes('hammer') || filename.includes('on-tap-tong-hop')) {
        // This is NEW Ch4 - keep as is
        newCh = 4;
      } else {
        // This is OLD Ch4 (GEM Master AI) → Ch6
        newCh = 6;
      }
    }
    // Ch1 stays as Ch1
    // Ch7, Ch8 are new - keep as is

    if (newCh !== oldCh) {
      renameMap.push({
        oldPath: path.join(tier1Dir, filename),
        oldCh, oldLesson, newCh, newLesson
      });
    }
  }

  // Execute renames (do it in reverse order to avoid conflicts)
  renameMap.sort((a, b) => b.oldCh - a.oldCh || b.oldLesson - a.oldLesson);

  for (const item of renameMap) {
    const result = renumberFile(item.oldPath, item.oldCh, item.oldLesson, item.newCh, item.newLesson, 1);
    console.log(`  ${result.old} → ${result.new}`);
  }

  console.log(`\n✅ TIER 1: ${renameMap.length} files renumbered`);
}

// TIER 2 Renumbering
function renumberTier2() {
  console.log('\n=== TIER 2 Renumbering ===\n');

  const files = fs.readdirSync(tier2Dir)
    .filter(f => f.endsWith('.html') && f.startsWith('tier-2-bai-'))
    .sort();

  const renameMap = [];

  for (const filename of files) {
    const match = filename.match(/tier-2-bai-(\d+)\.(\d+)-/);
    if (!match) continue;

    const oldCh = parseInt(match[1]);
    const oldLesson = parseInt(match[2]);
    let newCh = oldCh;
    let newLesson = oldLesson;

    // Ch1-6 stay the same (DPD, UPU, UPD, DPU, HFZ, LFZ)
    // Ch7: NEW lessons 7.1-7.3 + OLD Triangle becomes 7.4-7.8
    if (oldCh === 7) {
      // Check if it's the NEW Doji/Rounding files
      if (filename.includes('-NEW') || filename.includes('doji') ||
          filename.includes('rounding-bottom') || filename.includes('rounding-top')) {
        // Keep as is (new files)
      } else {
        // OLD Triangle files: 7.1→7.4, 7.2→7.5, etc
        newLesson = oldLesson + 3;
      }
    }
    // Ch8-10: Will be consolidated to Ch8 (Multi-TF + Risk)
    else if (oldCh === 8) {
      // Keep as Ch8
    } else if (oldCh === 9) {
      // Zone Scoring - remove or merge (outline doesn't have this)
      // For now, skip renumbering - will handle manually
    } else if (oldCh === 10) {
      // Risk Management - merge with Ch8
      // Renumber to Ch8.6-8.10 or similar
      newCh = 8;
      newLesson = oldLesson + 5; // 10.1→8.6, 10.2→8.7, etc
    } else if (oldCh === 11) {
      // Module A → Ch9
      newCh = 9;
    } else if (oldCh === 12) {
      // Module B → Ch10
      newCh = 10;
    }

    if (newCh !== oldCh || newLesson !== oldLesson) {
      renameMap.push({
        oldPath: path.join(tier2Dir, filename),
        oldCh, oldLesson, newCh, newLesson
      });
    }
  }

  // Execute renames
  renameMap.sort((a, b) => b.oldCh - a.oldCh || b.oldLesson - a.oldLesson);

  for (const item of renameMap) {
    const result = renumberFile(item.oldPath, item.oldCh, item.oldLesson, item.newCh, item.newLesson, 2);
    console.log(`  ${result.old} → ${result.new}`);
  }

  console.log(`\n✅ TIER 2: ${renameMap.length} files renumbered`);
}

// TIER 3 Renumbering
function renumberTier3() {
  console.log('\n=== TIER 3 Renumbering ===\n');

  const files = fs.readdirSync(tier3Dir)
    .filter(f => f.endsWith('.html') && f.startsWith('tier-3-bai-'))
    .sort();

  const renameMap = [];

  for (const filename of files) {
    const match = filename.match(/tier-3-bai-(\d+)\.(\d+)-/);
    if (!match) continue;

    const oldCh = parseInt(match[1]);
    const oldLesson = parseInt(match[2]);
    let newCh = oldCh;
    let newLesson = oldLesson;

    // Ch1 stays (Flag & Pennant)
    // Ch2: NEW Wedge stays as Ch2, OLD Candlestick → Ch3
    if (oldCh === 2) {
      if (filename.includes('-NEW') || filename.includes('wedge')) {
        // Keep as Ch2 (new files)
      } else {
        // OLD Candlestick → Ch3
        newCh = 3;
      }
    }
    // Ch3: OLD AI Signals → Ch5
    else if (oldCh === 3) {
      newCh = 5;
    }
    // Ch4: NEW Advanced stays as Ch4, OLD Whale → Ch6
    else if (oldCh === 4) {
      if (filename.includes('-NEW') || filename.includes('cup-and-handle') ||
          filename.includes('three-methods') || filename.includes('advanced-patterns')) {
        // Keep as Ch4 (new files)
      } else {
        // OLD Whale → Ch6
        newCh = 6;
      }
    }
    // Ch5: OLD Portfolio → Ch7
    else if (oldCh === 5) {
      newCh = 7;
    }
    // Ch6: OLD Module A → Ch8
    else if (oldCh === 6) {
      newCh = 8;
    }
    // Ch7: OLD Module B → Ch9
    else if (oldCh === 7) {
      newCh = 9;
    }

    if (newCh !== oldCh || newLesson !== oldLesson) {
      renameMap.push({
        oldPath: path.join(tier3Dir, filename),
        oldCh, oldLesson, newCh, newLesson
      });
    }
  }

  // Execute renames
  renameMap.sort((a, b) => b.oldCh - a.oldCh || b.oldLesson - a.oldLesson);

  for (const item of renameMap) {
    const result = renumberFile(item.oldPath, item.oldCh, item.oldLesson, item.newCh, item.newLesson, 3);
    console.log(`  ${result.old} → ${result.new}`);
  }

  console.log(`\n✅ TIER 3: ${renameMap.length} files renumbered`);
}

// Main
function main() {
  const arg = process.argv[2];

  console.log('='.repeat(60));
  console.log('GEM Academy - Renumber All Tiers');
  console.log('='.repeat(60));

  if (!arg || arg === 'all') {
    renumberTier1();
    renumberTier2();
    renumberTier3();
  } else if (arg === 'tier1') {
    renumberTier1();
  } else if (arg === 'tier2') {
    renumberTier2();
  } else if (arg === 'tier3') {
    renumberTier3();
  }

  console.log('\n' + '='.repeat(60));
  console.log('RENUMBERING COMPLETE');
  console.log('='.repeat(60));
}

main();
