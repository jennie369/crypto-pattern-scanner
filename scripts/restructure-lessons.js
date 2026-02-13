/**
 * GEM Academy - Restructure Lessons
 * Script để rename files và update badge trong các bài học
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tier1Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-1');
const tier2Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-2');

// Mapping for TIER 2 (old chapter -> new chapter)
const tier2ChapterMapping = {
  'ch2': { newChapter: 1, pattern: 'DPD' },    // DPD -> TIER 2 Chapter 1
  'ch3': { newChapter: 2, pattern: 'UPU' },    // UPU -> TIER 2 Chapter 2
  'ch4': { newChapter: 3, pattern: 'UPD' },    // UPD -> TIER 2 Chapter 3
  'ch5': { newChapter: 4, pattern: 'DPU' },    // DPU -> TIER 2 Chapter 4
};

// Mapping for TIER 1 (old chapter -> new chapter)
const tier1ChapterMapping = {
  'ch1': { newChapter: 1, name: 'Giới Thiệu' },     // Intro stays Chapter 1
  'ch6': { newChapter: 2, name: 'Classic Patterns' }, // Classic -> Chapter 2
  'ch7': { newChapter: 3, name: 'Paper Trading' },    // Paper Trading -> Chapter 3
  'ch8': { newChapter: 4, name: 'GEM Master AI' },    // GEM AI -> Chapter 4
};

function processFile(filePath, tier, chapterMapping) {
  const filename = path.basename(filePath);

  // Extract old chapter and lesson from filename
  // Format: tier1-ch2-l1-bai-2-1-dpd-la-gi.html
  const match = filename.match(/tier1-(ch\d+)-l(\d+)-bai-(\d+)-(\d+)-(.+)\.html/);
  if (!match) {
    console.log(`  ⚠️ Cannot parse: ${filename}`);
    return null;
  }

  const [, oldChapter, lessonNum, , , slug] = match;
  const mapping = chapterMapping[oldChapter];

  if (!mapping) {
    console.log(`  ⚠️ No mapping for: ${oldChapter}`);
    return null;
  }

  const newChapter = mapping.newChapter;

  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update the badge
  // Old: 📚 TIER 1 • Chương 2 • Bài 2.1
  // New for TIER 2: 📚 TIER 2 • Chương 1 • Bài 1.1
  const oldBadgePattern = /📚 TIER 1 • Chương \d+ • Bài \d+\.\d+/g;
  const newBadge = `📚 TIER ${tier} • Chương ${newChapter} • Bài ${newChapter}.${lessonNum}`;
  content = content.replace(oldBadgePattern, newBadge);

  // Create new filename
  const newFilename = `tier-${tier}-bai-${newChapter}.${lessonNum}-${slug}.html`;
  const newPath = path.join(path.dirname(filePath), newFilename);

  // Write updated content
  fs.writeFileSync(newPath, content, 'utf-8');

  // Delete old file if different name
  if (filePath !== newPath) {
    fs.unlinkSync(filePath);
  }

  console.log(`  ✅ ${filename} → ${newFilename}`);
  return newFilename;
}

function processTier(tierDir, tier, chapterMapping) {
  console.log(`\n📁 Processing TIER ${tier}...`);
  console.log('-'.repeat(60));

  const files = fs.readdirSync(tierDir).filter(f => f.endsWith('.html'));
  let processed = 0;

  for (const file of files) {
    const filePath = path.join(tierDir, file);
    const result = processFile(filePath, tier, chapterMapping);
    if (result) processed++;
  }

  console.log(`\n  Processed: ${processed} files`);
  return processed;
}

function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Restructure Lessons');
  console.log('='.repeat(60));

  let total = 0;

  // Process TIER 1
  total += processTier(tier1Dir, 1, tier1ChapterMapping);

  // Process TIER 2
  total += processTier(tier2Dir, 2, tier2ChapterMapping);

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Total files processed: ${total}`);
}

main();
