/**
 * Fix Missing Closing Brackets Script
 * Finds and fixes ALL missing )}  closings in JSX files
 *
 * Pattern to fix:
 * {condition && (
 *   <Component />
 * <NextElement   <- Missing )} before this
 *
 * Also fixes:
 * ) : (
 *   <Component />
 * <NextElement   <- Missing )} before this
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
};

const stats = {
  scanned: 0,
  fixed: 0,
  totalFixes: 0,
  fixedFiles: [],
};

function fixFile(filePath) {
  const filename = path.basename(filePath);
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    // Split into lines for analysis
    const lines = content.split('\n');
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
      const prevLine = lines[i - 1] || '';

      // Get indentation of current line
      const currentIndent = line.match(/^(\s*)/)?.[1]?.length || 0;
      const nextIndent = nextLine.match(/^(\s*)/)?.[1]?.length || 0;

      // Pattern 1: Line ends with /> or </Tag> and next line starts with < at same or lower indent
      // But current line is inside a conditional (check previous lines for && ( or : ()
      const endsWithJSXClose = line.trim().match(/\/>$|<\/\w+>$/);
      const nextStartsWithJSX = nextLine.trim().match(/^<[A-Z]/);
      const nextStartsWithClosingTag = nextLine.trim().match(/^<\/[A-Z]/);
      const nextStartsWithCurlyComment = nextLine.trim().match(/^\{\/\*/);

      // Check if we're missing a )}
      if (endsWithJSXClose && (nextStartsWithJSX || nextStartsWithClosingTag || nextStartsWithCurlyComment)) {
        // Look back to see if we're in an unclosed conditional
        let openConditionals = 0;
        let closeConditionals = 0;

        // Count opening patterns in recent lines (look back up to 30 lines)
        for (let j = Math.max(0, i - 30); j <= i; j++) {
          const checkLine = lines[j];
          // Count opening conditionals: && ( or ? ( or : (
          const opens = (checkLine.match(/&&\s*\((?!\))/g) || []).length +
                        (checkLine.match(/\?\s*\((?!\))/g) || []).length +
                        (checkLine.match(/:\s*\((?!\))/g) || []).length;
          // Count closing )}
          const closes = (checkLine.match(/\)\}/g) || []).length;
          openConditionals += opens;
          closeConditionals += closes;
        }

        // If we have more opens than closes, we need to add )}
        if (openConditionals > closeConditionals) {
          // Check next line doesn't already have )}
          if (!nextLine.trim().startsWith(')}') && !nextLine.trim().match(/^\)\s*\}/)) {
            // Add )} with proper indentation
            const indent = ' '.repeat(Math.max(0, currentIndent - 2));
            fixedLines.push(line);
            fixedLines.push(indent + ')}');
            fixCount++;
            continue;
          }
        }
      }

      // Pattern 2: Line ends with </Tag> followed by blank line then content at wrong indent
      // This is already handled above

      fixedLines.push(line);
    }

    if (fixCount > 0) {
      content = fixedLines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  [FIXED] ${relPath} (${fixCount} fixes)`);
      stats.fixed++;
      stats.totalFixes += fixCount;
      stats.fixedFiles.push({ file: relPath, fixes: fixCount });
      return true;
    }

    return false;
  } catch (error) {
    // Skip files with read errors
    return false;
  }
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', 'backups', '__tests__', 'backups_20260129', '.git'].includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
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
  console.log('  Fix Missing Closing Brackets');
  console.log('========================================');
  console.log('');

  scanDirectory(CONFIG.srcDir);

  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================');
  console.log(`Files scanned: ${stats.scanned}`);
  console.log(`Files fixed:   ${stats.fixed}`);
  console.log(`Total fixes:   ${stats.totalFixes}`);

  if (stats.fixedFiles.length > 0) {
    console.log('\nFixed files:');
    stats.fixedFiles.forEach(f => console.log(`  - ${f.file} (${f.fixes} fixes)`));
  }
}

main();
