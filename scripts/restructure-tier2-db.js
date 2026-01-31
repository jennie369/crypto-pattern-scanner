/**
 * GEM Academy - Restructure TIER 2 Database Files
 * Script để rename và update badge cho các file từ TIER 2 database
 * Các file này cần được thêm sau 4 chapters pattern (DPD, UPU, UPD, DPU)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tier2Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-2');

// Mapping for TIER 2 database files (old chapter -> new chapter)
// Chapters 1-4 are already taken by DPD, UPU, UPD, DPU
const tier2DbChapterMapping = {
  'ch1': { newChapter: 5, name: 'HFZ Mastery' },      // HFZ -> Chapter 5
  'ch2': { newChapter: 6, name: 'LFZ Mastery' },      // LFZ -> Chapter 6
  'ch3': { newChapter: 7, name: 'Triangle Patterns' }, // Triangles -> Chapter 7
  'ch4': { newChapter: 8, name: 'Multi-TF Analysis' }, // Multi-TF -> Chapter 8
  'ch5': { newChapter: 9, name: 'Zone Scoring' },      // Zone Scoring -> Chapter 9
  'ch6': { newChapter: 10, name: 'Risk Management' },   // Risk -> Chapter 10
  'ch7': { newChapter: 11, name: 'Module A' },          // Module A -> Chapter 11
  'ch8': { newChapter: 12, name: 'Module B' },          // Module B -> Chapter 12
};

function processFile(filePath) {
  const filename = path.basename(filePath);

  // Skip already processed files (tier-2-bai-*.html)
  if (filename.startsWith('tier-2-bai-')) {
    return null;
  }

  // Extract old chapter and lesson from filename
  // Format: ch1-l1-bai-1-1-hfz-la-gi-gem-trading-academy.html
  const match = filename.match(/(ch\d+)-l(\d+)-bai-(\d+)-(\d+)-(.+)\.html/);
  if (!match) {
    console.log(`  ⚠️ Cannot parse: ${filename}`);
    return null;
  }

  const [, oldChapter, lessonNum, , , slug] = match;
  const mapping = tier2DbChapterMapping[oldChapter];

  if (!mapping) {
    console.log(`  ⚠️ No mapping for: ${oldChapter}`);
    return null;
  }

  const newChapter = mapping.newChapter;

  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update the badge - multiple patterns to match
  // Pattern 1: 📚 TIER 2 • Chương X • Bài X.X
  // Pattern 2: 📚 Tier 2 • Chương X • Bài X.X
  // Pattern 3: Just contains old chapter/lesson numbers
  const badgePatterns = [
    /📚 TIER 2 • Chương \d+ • Bài \d+\.\d+/g,
    /📚 Tier 2 • Chương \d+ • Bài \d+\.\d+/g,
    /TIER 2 • Chương \d+ • Bài \d+\.\d+/g,
  ];

  const newBadge = `📚 TIER 2 • Chương ${newChapter} • Bài ${newChapter}.${lessonNum}`;

  for (const pattern of badgePatterns) {
    content = content.replace(pattern, newBadge);
  }

  // Also update title tag if it contains chapter info
  // <title>Bài 1.1: HFZ... -> <title>Bài 5.1: HFZ...
  content = content.replace(
    /(<title>Bài )\d+\.\d+(:.+<\/title>)/g,
    `$1${newChapter}.${lessonNum}$2`
  );

  // Create new filename
  const newFilename = `tier-2-bai-${newChapter}.${lessonNum}-${slug}.html`;
  const newPath = path.join(path.dirname(filePath), newFilename);

  // Write updated content
  fs.writeFileSync(newPath, content, 'utf-8');

  // Delete old file
  if (filePath !== newPath) {
    fs.unlinkSync(filePath);
  }

  console.log(`  ✅ ${filename} → ${newFilename}`);
  return newFilename;
}

function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Restructure TIER 2 Database Files');
  console.log('='.repeat(60));

  const files = fs.readdirSync(tier2Dir)
    .filter(f => f.endsWith('.html') && !f.startsWith('tier-2-bai-'))
    .sort();

  console.log(`\n📁 Found ${files.length} files to process...`);
  console.log('-'.repeat(60));

  let processed = 0;
  for (const file of files) {
    const filePath = path.join(tier2Dir, file);
    const result = processFile(filePath);
    if (result) processed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Files processed: ${processed}`);

  // List final structure
  console.log('\n📋 Final TIER 2 Structure:');
  const finalFiles = fs.readdirSync(tier2Dir)
    .filter(f => f.endsWith('.html'))
    .sort();

  const chapters = {};
  for (const file of finalFiles) {
    const match = file.match(/tier-2-bai-(\d+)\./);
    if (match) {
      const ch = match[1];
      if (!chapters[ch]) chapters[ch] = [];
      chapters[ch].push(file);
    }
  }

  for (const ch of Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b))) {
    console.log(`   Chapter ${ch}: ${chapters[ch].length} lessons`);
  }
}

main();
