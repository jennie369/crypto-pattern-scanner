/**
 * Script to parse gender-organized image URLs from pic.txt
 * and generate the SAMPLE_IMAGES structure for seedPostGenerator.js
 */

const fs = require('fs');
const path = require('path');

// Read the pic.txt file
const filePath = path.join('C:', 'Users', 'Jennie Chu', 'Downloads', 'pic.txt');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Parse URLs from a range of lines
function parseURLs(lines, startLine, endLine) {
  const urls = [];
  for (let i = startLine - 1; i < endLine && i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/'(https:\/\/i\.pinimg\.com\/[^']+)'/);
    if (match) {
      urls.push(match[1]);
    }
  }
  return urls;
}

// Define the line ranges for each section based on the file structure
const sections = {
  trading: {
    male: { start: 6, end: 95 },
    female: { start: 97, end: 202 }
  },
  crystal: {
    male: { start: 208, end: 295 },
    female: { start: 297, end: 422 }
  },
  loa: {
    male: { start: 428, end: 567 },
    female: { start: 569, end: 762 }
  },
  education: {
    male: { start: 768, end: 1016 },
    female: { start: 1018, end: 1068 }
  },
  wealth: {
    male: { start: 1074, end: 1166 },
    female: { start: 1168, end: 1231 }
  },
  affiliate: {
    male: { start: 1237, end: 1263 },
    female: { start: 1265, end: 1407 }
  }
};

// Parse all sections
const SAMPLE_IMAGES = {};
for (const [topic, ranges] of Object.entries(sections)) {
  SAMPLE_IMAGES[topic] = {
    male: parseURLs(lines, ranges.male.start, ranges.male.end),
    female: parseURLs(lines, ranges.female.start, ranges.female.end)
  };
}

// Generate output
console.log('/**');
console.log(' * Post images - NGƯỜI CHÂU Á / VIỆT NAM / DOUYIN STYLE');
console.log(' * Gender-organized for accurate post generation');
console.log(' */');
console.log('');
console.log('const SAMPLE_IMAGES = {');

for (const [topic, genders] of Object.entries(SAMPLE_IMAGES)) {
  console.log(`  ${topic}: {`);
  console.log(`    male: [`);
  genders.male.forEach((url, i) => {
    const comma = i < genders.male.length - 1 ? ',' : '';
    console.log(`      '${url}'${comma}`);
  });
  console.log(`    ],`);
  console.log(`    female: [`);
  genders.female.forEach((url, i) => {
    const comma = i < genders.female.length - 1 ? ',' : '';
    console.log(`      '${url}'${comma}`);
  });
  console.log(`    ]`);
  console.log(`  },`);
}

console.log('};');
console.log('');

// Print stats
console.log('// Stats:');
for (const [topic, genders] of Object.entries(SAMPLE_IMAGES)) {
  console.log(`// ${topic}: male=${genders.male.length}, female=${genders.female.length}`);
}
