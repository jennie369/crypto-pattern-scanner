/**
 * Fix ALL Loading Patterns - Comprehensive Script
 *
 * Fixes both patterns:
 * 1. if (loading) { return <Loading /> }
 * 2. {loading ? (<Loading />) : (<Content />)}
 *
 * Usage: node scripts/fix-all-loading-patterns.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  srcDir: path.join(__dirname, '../src/screens'),
  dryRun: process.argv.includes('--dry-run'),
};

const stats = {
  scanned: 0,
  fixed: 0,
  skipped: 0,
  errors: [],
  fixedFiles: [],
};

function fixFile(filePath) {
  const filename = path.basename(filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    // Pattern 1: {loading ? (<View...ActivityIndicator...</View>) : (content)}
    // Replace with just the content
    const ternaryPattern1 = /\{loading\s*\?\s*\(\s*<View[^>]*>\s*(?:<[^>]*>)*\s*<ActivityIndicator[^/]*\/>\s*(?:<Text[^>]*>[^<]*<\/Text>)?\s*<\/View>\s*\)\s*:\s*\(/g;
    if (ternaryPattern1.test(content)) {
      content = content.replace(ternaryPattern1, '{/* Loading removed */ (');
      modified = true;
    }

    // Pattern 2: loading ? renderLoading() : hasError ? ...
    // Just remove the loading check
    const ternaryPattern2 = /loading\s*\?\s*\(\s*<View[^>]*style=\{styles\.loadingContainer\}[^>]*>[\s\S]*?<\/View>\s*\)\s*:\s*/g;
    if (ternaryPattern2.test(content)) {
      content = content.replace(ternaryPattern2, '');
      modified = true;
    }

    // Pattern 3: {loading ? (<ActivityIndicator ... />) : (<Text>...</Text>)}
    // Replace inline loading spinners with just the text
    const inlinePattern = /\{loading\s*\?\s*\(\s*<ActivityIndicator[^/]*\/>\s*\)\s*:\s*\(\s*(<Text[^>]*>[^<]*<\/Text>)\s*\)\}/g;
    if (inlinePattern.test(content)) {
      content = content.replace(inlinePattern, '$1');
      modified = true;
    }

    // Pattern 4: loading ? renderLoadingSkeleton() : hasError ? ...
    const skeletonPattern = /loading\s*\?\s*(?:renderLoadingSkeleton\(\)|renderLoading\(\))\s*:\s*/g;
    if (skeletonPattern.test(content)) {
      content = content.replace(skeletonPattern, '');
      modified = true;
    }

    if (modified && content !== originalContent) {
      if (CONFIG.dryRun) {
        console.log(`  [DRY-RUN] Would fix: ${filename}`);
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  [FIXED] ${filename}`);
      }
      stats.fixed++;
      stats.fixedFiles.push(filename);
      return true;
    }

    return false;
  } catch (error) {
    if (!error.message.includes('UNKNOWN')) {
      console.error(`  [ERROR] ${filename}: ${error.message}`);
      stats.errors.push({ file: filename, error: error.message });
    }
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
  console.log('  Fix ALL Loading Patterns');
  console.log('========================================');
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY-RUN' : 'LIVE'}`);
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
