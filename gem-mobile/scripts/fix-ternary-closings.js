/**
 * Fix Ternary Closings Script
 *
 * Finds and fixes missing )} for ternary expressions like:
 * {condition ? (
 *   <Component />
 * ) : (
 *   <OtherComponent />      <- Missing )} after this
 * </ParentComponent>        <- Parent closes without ternary closing
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  dryRun: process.argv.includes('--dry-run'),
};

const stats = {
  scanned: 0,
  fixed: 0,
  totalFixes: 0,
  fixedFiles: [],
};

function fixFile(filePath) {
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    const lines = content.split('\n');
    const fixedLines = [];

    // Track ternary/conditional state
    let inTernaryElse = false; // After ) : (
    let inConditional = false; // After && (
    let ternaryIndent = 0;
    let conditionalIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const indent = line.match(/^(\s*)/)?.[1]?.length || 0;

      // Detect start of ternary else: ) : (
      if (trimmed.match(/^\)\s*:\s*\($/)) {
        inTernaryElse = true;
        ternaryIndent = indent;
      }

      // Detect start of conditional: && (
      if (trimmed.match(/&&\s*\($/) || trimmed.match(/&&\s*\($/)) {
        inConditional = true;
        conditionalIndent = indent;
      }

      // Detect inline start: something && ( or ? (
      if (line.match(/\s+&&\s+\($/) && !trimmed.startsWith('&&')) {
        inConditional = true;
        conditionalIndent = indent + 2; // Indent of content will be +2
      }

      // Check if we need to close a ternary/conditional
      // Pattern: We're in ternary/conditional, line ends with closing tag, and next significant line is a different closing tag
      if ((inTernaryElse || inConditional) && trimmed.match(/<\/\w+>$|^\/>$/)) {
        const nextIdx = i + 1;
        let nextLine = lines[nextIdx];

        // Skip empty lines
        let checkIdx = nextIdx;
        while (checkIdx < lines.length && lines[checkIdx].trim() === '') {
          checkIdx++;
        }
        nextLine = lines[checkIdx] || '';
        const nextTrimmed = nextLine.trim();
        const nextIndent = nextLine.match(/^(\s*)/)?.[1]?.length || 0;

        // If next line is a closing tag at same or lower indent, we might need )}
        if (nextTrimmed.match(/^<\/\w+>$/) && nextIndent <= indent) {
          // Check if there's no )} between current line and closing tag
          let hasClosing = false;
          for (let j = i + 1; j < checkIdx; j++) {
            if (lines[j].trim().match(/^\)\}$/)) {
              hasClosing = true;
              break;
            }
          }

          if (!hasClosing) {
            // Add )} before the closing tag
            const closingIndent = ' '.repeat(Math.max(0, indent - 2));
            fixedLines.push(line);
            fixedLines.push(closingIndent + ')}');
            fixCount++;

            // Reset state
            if (inTernaryElse) inTernaryElse = false;
            if (inConditional) inConditional = false;
            continue;
          }
        }

        // If next line starts with {/* comment or new JSX element at same/lower indent
        if ((nextTrimmed.startsWith('{/*') || nextTrimmed.match(/^<[A-Z]/)) && nextIndent <= indent) {
          const closingIndent = ' '.repeat(Math.max(0, indent - 2));
          fixedLines.push(line);
          fixedLines.push(closingIndent + ')}');
          fixCount++;

          if (inTernaryElse) inTernaryElse = false;
          if (inConditional) inConditional = false;
          continue;
        }
      }

      // Reset state if we see )}
      if (trimmed === ')}') {
        if (inTernaryElse && indent <= ternaryIndent) {
          inTernaryElse = false;
        }
        if (inConditional && indent <= conditionalIndent) {
          inConditional = false;
        }
      }

      fixedLines.push(line);
    }

    if (fixCount > 0) {
      content = fixedLines.join('\n');

      if (CONFIG.dryRun) {
        console.log(`  [DRY-RUN] ${relPath} (${fixCount} fixes)`);
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  [FIXED] ${relPath} (${fixCount} fixes)`);
      }

      stats.fixed++;
      stats.totalFixes += fixCount;
      stats.fixedFiles.push({ file: relPath, fixes: fixCount });
      return true;
    }

    return false;
  } catch (error) {
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
    console.error(`Error scanning ${dir}: ${error.message}`);
  }
}

function main() {
  console.log('========================================');
  console.log('  Fix Ternary Closings');
  console.log(`  Mode: ${CONFIG.dryRun ? 'DRY-RUN' : 'LIVE'}`);
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
