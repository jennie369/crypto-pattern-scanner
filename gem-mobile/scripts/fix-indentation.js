/**
 * Fix Indentation Issues Script
 * Fixes the extra indentation left by the loading removal script
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  srcDir: path.join(__dirname, '../src/screens'),
};

const stats = {
  scanned: 0,
  fixed: 0,
  fixedFiles: [],
};

function fixFile(filePath) {
  const filename = path.basename(filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Pattern: blank line followed by content with 2 extra spaces of indentation
    // This happens when ternary was removed but indentation wasn't fixed

    // Fix pattern: {/* Content */} or similar comment, then blank line, then over-indented content
    // The content has 2 extra spaces that need to be removed

    // Step 1: Fix FlatList with extra indentation after Content comment
    content = content.replace(
      /(\{\/\* Content \*\/\})\s*\n\s+\n(\s+)<FlatList/g,
      '$1\n$2<FlatList'
    );

    // Step 2: Fix ScrollView with extra indentation
    content = content.replace(
      /(\{\/\* Content \*\/\})\s*\n\s+\n(\s+)<ScrollView/g,
      '$1\n$2<ScrollView'
    );

    // Step 3: Fix any List/View comment patterns
    content = content.replace(
      /(\{\/\* .+List \*\/\})\s*\n\s+\n(\s+)</g,
      '$1\n$2<'
    );

    // Step 4: Remove extra 2-space indentation from blocks
    // Pattern: line with 10+ spaces followed by closing tag with 6 spaces
    // This indicates 2 extra spaces were added
    const lines = content.split('\n');
    let fixed = false;
    let inBrokenBlock = false;
    let baseIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      // Detect start of broken indentation block
      if (lines[i].match(/^\s{8}\{\/\* Content \*\/\}$/) ||
          lines[i].match(/^\s{8}\{\/\* .+List \*\/\}$/)) {
        // Check if next non-empty line has extra indentation (10+ spaces when should be 8)
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          if (lines[j].trim() && lines[j].match(/^\s{10,}</)) {
            inBrokenBlock = true;
            baseIndent = 8;
            break;
          }
        }
      }

      // Fix indentation if in broken block
      if (inBrokenBlock && lines[i].match(/^\s{10,}/)) {
        const currentIndent = lines[i].match(/^(\s*)/)[1].length;
        if (currentIndent >= baseIndent + 2) {
          lines[i] = lines[i].substring(2); // Remove 2 spaces
          fixed = true;
        }
      }

      // Detect end of block (closing SafeAreaView or similar at base indent)
      if (inBrokenBlock && lines[i].match(/^\s{6}<\/SafeAreaView>/)) {
        inBrokenBlock = false;
      }
    }

    if (fixed) {
      content = lines.join('\n');
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  [FIXED] ${filename}`);
      stats.fixed++;
      stats.fixedFiles.push(filename);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`  [ERROR] ${filename}: ${error.message}`);
    return false;
  }
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', 'backups', '__tests__', 'backups_20260129'].includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        stats.scanned++;
        fixFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}: ${error.message}`);
  }
}

function main() {
  console.log('========================================');
  console.log('  Fix Indentation Issues');
  console.log('========================================');
  console.log('');

  scanDirectory(CONFIG.srcDir);

  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================');
  console.log(`Files scanned: ${stats.scanned}`);
  console.log(`Files fixed:   ${stats.fixed}`);

  if (stats.fixedFiles.length > 0) {
    console.log('\nFixed files:');
    stats.fixedFiles.forEach(f => console.log(`  - ${f}`));
  }
}

main();
