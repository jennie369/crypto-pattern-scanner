/**
 * GEM Academy - Restructure TIER 3 Files
 * Script để rename và update badge cho các file TIER 3
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tier3Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-3');

function processFile(filePath) {
  const filename = path.basename(filePath);

  // Skip already processed files
  if (filename.startsWith('tier-3-bai-')) {
    return null;
  }

  // Extract chapter and lesson from filename
  // Format: ch1-l1-bai-1-1-flag-pattern-la-gi.html
  const match = filename.match(/ch(\d+)-l(\d+)-bai-(\d+)-(\d+)-(.+)\.html/);
  if (!match) {
    console.log(`  ⚠️ Cannot parse: ${filename}`);
    return null;
  }

  const [, chapter, lessonNum, , , slug] = match;

  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update the badge
  const badgePatterns = [
    /📚 TIER 3 • Chương \d+ • Bài \d+\.\d+/g,
    /📚 Tier 3 • Chương \d+ • Bài \d+\.\d+/g,
    /TIER 3 • Chương \d+ • Bài \d+\.\d+/g,
  ];

  const newBadge = `📚 TIER 3 • Chương ${chapter} • Bài ${chapter}.${lessonNum}`;

  for (const pattern of badgePatterns) {
    content = content.replace(pattern, newBadge);
  }

  // Create new filename
  const newFilename = `tier-3-bai-${chapter}.${lessonNum}-${slug}.html`;
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
  console.log('GEM Academy - Restructure TIER 3 Files');
  console.log('='.repeat(60));

  const files = fs.readdirSync(tier3Dir)
    .filter(f => f.endsWith('.html') && !f.startsWith('tier-3-bai-'))
    .sort();

  console.log(`\n📁 Found ${files.length} files to process...`);
  console.log('-'.repeat(60));

  let processed = 0;
  for (const file of files) {
    const filePath = path.join(tier3Dir, file);
    const result = processFile(filePath);
    if (result) processed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Files processed: ${processed}`);

  // List final structure
  console.log('\n📋 Final TIER 3 Structure:');
  const finalFiles = fs.readdirSync(tier3Dir)
    .filter(f => f.endsWith('.html'))
    .sort();

  const chapters = {};
  for (const file of finalFiles) {
    const match = file.match(/tier-3-bai-(\d+)\./);
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
