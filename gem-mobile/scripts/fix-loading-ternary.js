/**
 * Fix Loading Ternary Pattern
 *
 * This script fixes the ternary loading pattern:
 * {loading ? (<Loading />) : (<Content />)}
 *
 * Changes to just show content without loading block.
 *
 * Usage: node scripts/fix-loading-ternary.js [--dry-run]
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
  errors: [],
  fixedFiles: [],
};

// Pattern to match loading ternary with ActivityIndicator
// {loading ? (
//   <View>
//     <ActivityIndicator />
//   </View>
// ) : (
//   <ActualContent />
// )}
const LOADING_TERNARY_PATTERN = /\{loading\s*\?\s*\(\s*<(?:View|SafeAreaView)[^>]*>\s*(?:<[^>]*>)*\s*<ActivityIndicator[^/]*\/>\s*(?:<[^>]*>[^<]*<\/[^>]*>)*\s*<\/(?:View|SafeAreaView)>\s*\)\s*:\s*\(/g;

function fixFile(filePath) {
  const filename = path.basename(filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Check if file has the ternary pattern
    if (!content.includes('{loading ? (')) {
      return false;
    }

    // Skip if already has "Never blocks UI" comment
    if (content.includes('Never blocks UI') || content.includes('no loading block')) {
      return false;
    }

    // Find and replace the loading ternary pattern
    // This is a simpler approach - just remove the loading condition wrapper

    // Pattern 1: {loading ? (<Loading />) : (<Content />)}
    // Replace with just the content part

    let modified = false;

    // Simple replacement for common pattern
    const simplePattern = /\{loading\s*\?\s*\(\s*<View[^>]*style=\{styles\.loadingContainer\}[^>]*>\s*<ActivityIndicator[^/]*\/>\s*(?:<Text[^>]*>[^<]*<\/Text>)?\s*<\/View>\s*\)\s*:\s*\(/g;

    if (simplePattern.test(content)) {
      content = content.replace(simplePattern, '{/* Loading removed - show content immediately */ (');
      modified = true;
    }

    // Also handle the closing )} that was part of the ternary
    // This is tricky because we need to find the matching one

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
    console.error(`  [ERROR] ${filename}: ${error.message}`);
    stats.errors.push({ file: filename, error: error.message });
    return false;
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', 'backups', '__tests__'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      stats.scanned++;
      fixFile(fullPath);
    }
  }
}

function main() {
  console.log('========================================');
  console.log('  Fix Loading Ternary Pattern');
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
}

main();
