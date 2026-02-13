/**
 * Fix Broken Loading Comments Script
 *
 * Fixes the broken JSX pattern left by previous script:
 * Removes broken comment wrapper from JSX
 *
 * Usage: node scripts/fix-broken-loading-comments.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  srcDir: path.join(__dirname, '../src/screens'),
};

const stats = {
  scanned: 0,
  fixed: 0,
  errors: [],
  fixedFiles: [],
};

function fixFile(filePath) {
  const filename = path.basename(filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Pattern: {/* Loading removed */ ( followed by JSX and closing )}
    // Replace with just the JSX content (remove wrapper)

    // Step 1: Remove the opening comment pattern
    // {/* Loading removed */ ( -> (nothing - we'll just open the content)
    const openingPattern = /\{\s*\/\*\s*Loading removed\s*\*\/\s*\(/g;
    if (openingPattern.test(content)) {
      content = content.replace(openingPattern, '');

      // Step 2: Find and remove the corresponding orphaned closing )}
      // This is tricky - we need to find )}  that follows the content
      // Look for )} followed by newline and then either more JSX or closing tag

      // After removing the opening, we have content followed by )}
      // We need to remove just the )} that closes the ternary

      // Pattern: content ends with /> then newline(s) then )}
      content = content.replace(/(\s*\/>)\s*\n\s*\)\}/g, '$1');

      // Pattern: content ends with </ComponentName> then newline(s) then )}
      content = content.replace(/(<\/\w+>)\s*\n\s*\)\}/g, '$1');

      // Pattern: Just )} on its own line after a component
      content = content.replace(/\n\s+\)\}\s*\n(\s+\{\/\*)/g, '\n$1');
      content = content.replace(/\n\s+\)\}\s*\n(\s+<)/g, '\n$1');
      content = content.replace(/\n\s+\)\}\s*\n(\s+\{Alert)/g, '\n$1');
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
    stats.errors.push({ file: filename, error: error.message });
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
  console.log('  Fix Broken Loading Comments');
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

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }
}

main();
