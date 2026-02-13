const fs = require('fs');
const path = require('path');
const BASE_DIR = path.join(__dirname, 'Khóa Trading');

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/<title>(.*?)<\/title>/i);
  if (!match) return path.basename(filePath, '.html');
  return match[1]
    .replace(/ \| GEM Trading Academy/gi, '')
    .replace(/ - GEM Trading Academy/gi, '')
    .replace(/&amp;/g, '&')
    .trim();
}

function extractDescriptiveName(htmlTitle) {
  // Remove any "Bài X.Y:" or "Bai X.Y:" prefix (even nested ones)
  let result = htmlTitle;
  // Keep removing prefixes until none remain
  while (true) {
    const match = result.match(/^(?:Bài|Bai)\s*\d+\.\d+:\s*(.+)$/i);
    if (match) {
      result = match[1].trim();
    } else {
      break;
    }
  }
  return result;
}

// Fix titles that lack Vietnamese diacritics
const TITLE_FIXES = {
  'HFZ La Gi?': 'HFZ Là Gì?',
  'Cach Ve HFZ Chinh Xac': 'Cách Vẽ HFZ Chính Xác',
  'Falling Wedge - Cai Nem Giam': 'Falling Wedge - Cái Nêm Giảm',
  'Wedge vs Triangle - Phan Biet': 'Wedge vs Triangle - Phân Biệt',
  'Vi Du Thuc Te Wedge Patterns': 'Ví Dụ Thực Tế Wedge Patterns',
};

function fixDiacritics(name) {
  return TITLE_FIXES[name] || name;
}

function isModuleAFile(filename) {
  return filename.includes('con-nguoi-cu') ||
         filename.includes('ban-do-hanh-trinh') ||
         filename.includes('su-thay-doi-thuc-su') ||
         filename.includes('dieu-khien-ban');
}

const tiers = [
  { dir: 'tier-1', courseId: 'course-tier1-trading-foundation', tierNum: 1 },
  { dir: 'tier-2', courseId: 'course-tier2-trading-advanced', tierNum: 2 },
  { dir: 'tier-3', courseId: 'course-tier3-trading-mastery', tierNum: 3 },
];

const allValues = [];
const fileMap = [];

for (const tier of tiers) {
  const dir = path.join(BASE_DIR, tier.dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();

  const chapterFiles = {};
  for (const file of files) {
    const match = file.match(/bai-(\d+)\.(\d+)/);
    if (!match) continue;
    let ch = parseInt(match[1]);
    const ln = parseInt(match[2]);

    // Tier 2: handle duplicate chapter 9
    if (tier.dir === 'tier-2' && ch === 9) {
      ch = isModuleAFile(file) ? 10 : 9;
    }
    // Tier 2: original chapter 10 -> new chapter 11
    if (tier.dir === 'tier-2' && parseInt(match[1]) === 10) {
      ch = 11;
    }

    if (!chapterFiles[ch]) chapterFiles[ch] = [];
    chapterFiles[ch].push({ file, ch, ln });
  }

  for (const [chStr, lessons] of Object.entries(chapterFiles)) {
    const ch = parseInt(chStr);
    lessons.sort((a, b) => a.ln - b.ln);
    lessons.forEach((l, idx) => {
      const filePath = path.join(dir, l.file);
      const htmlTitle = extractTitle(filePath);
      const desc = extractDescriptiveName(htmlTitle);
      const fixedDesc = fixDiacritics(desc);
      const title = `Bài ${ch}.${l.ln}: ${fixedDesc}`;
      const id = `les-t${tier.tierNum}-${ch}.${l.ln}`;
      const moduleId = `mod-t${tier.tierNum}-ch${ch}`;

      const safeTitle = title.replace(/'/g, "''");
      allValues.push(`('${id}', '${moduleId}', '${tier.courseId}', '${safeTitle}', ${idx}, 'article', 'html', false, false)`);

      fileMap.push({ id, tier: tier.dir, file: l.file });
    });
  }
}

// Output SQL
const sql = `INSERT INTO course_lessons (id, module_id, course_id, title, order_index, type, content_type, is_preview, is_free_preview) VALUES\n${allValues.join(',\n')};`;

fs.writeFileSync(path.join(__dirname, 'insert-lessons.sql'), sql, 'utf8');
fs.writeFileSync(path.join(__dirname, 'file-map.json'), JSON.stringify(fileMap, null, 2), 'utf8');

console.log(`Generated insert-lessons.sql with ${allValues.length} records`);
console.log(`Generated file-map.json`);
console.log(`SQL size: ${Math.round(sql.length/1024)}KB`);

// Print summary
console.log('\n=== LESSON TITLES ===');
let currentModule = '';
for (const l of fileMap) {
  const idx = fileMap.indexOf(l);
  const val = allValues[idx];
  const titleMatch = val.match(/, '(Bài .+?)',/);
  if (titleMatch) {
    const modMatch = val.match(/'(mod-t\d+-ch\d+)'/);
    if (modMatch && modMatch[1] !== currentModule) {
      currentModule = modMatch[1];
      console.log(`\n--- ${currentModule} ---`);
    }
    console.log(`  ${titleMatch[1]}`);
  }
}
