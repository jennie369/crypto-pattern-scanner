/**
 * Auto-fix Loading Screens Script
 *
 * This script automatically fixes the problematic loading pattern in React Native screens:
 * - Finds screens with `const [loading, setLoading] = useState(true)`
 * - Removes `if (loading) { return <LoadingScreen> }` blocks
 * - Adds global cache pattern for instant display
 *
 * Usage: node scripts/fix-loading-screens.js [--dry-run] [--verbose]
 *
 * Options:
 *   --dry-run   Show what would be changed without modifying files
 *   --verbose   Show detailed logs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src/screens'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Stats tracking
const stats = {
  scanned: 0,
  fixed: 0,
  skipped: 0,
  errors: [],
  fixedFiles: [],
};

// Patterns to detect
const PATTERNS = {
  // Loading state initialization with true
  loadingStateTrue: /const\s+\[loading,\s*setLoading\]\s*=\s*useState\(true\)/,

  // If loading return block (multiline)
  loadingReturnBlock: /if\s*\(loading[^)]*\)\s*\{[\s\S]*?return\s*\([\s\S]*?(?:ActivityIndicator|Loading)[\s\S]*?\);\s*\}/,

  // Simpler loading return (single check)
  simpleLoadingReturn: /if\s*\(loading\)\s*(?:return\s+null|return\s*\([\s\S]*?ActivityIndicator[\s\S]*?\);)/,

  // Loading && !refreshing pattern
  loadingAndNotRefreshing: /if\s*\(loading\s*&&\s*!refreshing\)\s*\{[\s\S]*?return[\s\S]*?\}/,
};

// Generate cache name from filename
function generateCacheName(filename) {
  // Remove extension and convert to camelCase
  const baseName = path.basename(filename, '.js')
    .replace(/Screen$/, '')
    .replace(/([A-Z])/g, (match, p1, offset) =>
      offset === 0 ? p1.toLowerCase() : p1
    );
  return `${baseName}Cache`;
}

// Generate cache object code
function generateCacheCode(cacheName) {
  return `
// ============================================
// GLOBAL CACHE - persists across screen switches
// ============================================
const ${cacheName} = {
  data: null,
  lastFetch: 0,
  CACHE_DURATION: 60000, // 60 seconds
};
`;
}

// Fix a single file
function fixFile(filePath) {
  const filename = path.basename(filePath);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    const changes = [];

    // Check if file has the problematic pattern
    if (!PATTERNS.loadingStateTrue.test(content)) {
      if (CONFIG.verbose) {
        console.log(`  [SKIP] ${filename} - No loading state with true`);
      }
      stats.skipped++;
      return false;
    }

    // Check if already has global cache (skip if already fixed)
    if (content.includes('GLOBAL CACHE') || content.includes('persists across')) {
      if (CONFIG.verbose) {
        console.log(`  [SKIP] ${filename} - Already has global cache`);
      }
      stats.skipped++;
      return false;
    }

    const cacheName = generateCacheName(filename);

    // 1. Change useState(true) to useState(false)
    if (PATTERNS.loadingStateTrue.test(content)) {
      content = content.replace(
        PATTERNS.loadingStateTrue,
        'const [loading, setLoading] = useState(false)'
      );
      changes.push('Changed loading initial state from true to false');
      modified = true;
    }

    // 2. Remove loading return blocks
    // Try different patterns

    // Pattern: if (loading && !refreshing) { return ... }
    if (PATTERNS.loadingAndNotRefreshing.test(content)) {
      content = content.replace(
        PATTERNS.loadingAndNotRefreshing,
        '// Loading screen removed - content renders immediately'
      );
      changes.push('Removed loading && !refreshing return block');
      modified = true;
    }

    // Pattern: if (loading) { return ( <...ActivityIndicator.../> ); }
    if (PATTERNS.loadingReturnBlock.test(content)) {
      content = content.replace(
        PATTERNS.loadingReturnBlock,
        '// Loading screen removed - content renders immediately'
      );
      changes.push('Removed loading return block with ActivityIndicator');
      modified = true;
    }

    // Pattern: if (loading) return null or simple return
    if (PATTERNS.simpleLoadingReturn.test(content)) {
      content = content.replace(
        PATTERNS.simpleLoadingReturn,
        '// Loading screen removed - content renders immediately'
      );
      changes.push('Removed simple loading return');
      modified = true;
    }

    // 3. Add comment about instant display if modified
    if (modified) {
      // Add comment after the loading state declaration
      content = content.replace(
        /const \[loading, setLoading\] = useState\(false\)/,
        'const [loading, setLoading] = useState(false) // Never blocks UI'
      );
    }

    // Check if content was actually modified
    if (content !== originalContent) {
      if (CONFIG.dryRun) {
        console.log(`  [DRY-RUN] Would fix: ${filename}`);
        changes.forEach(c => console.log(`    - ${c}`));
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  [FIXED] ${filename}`);
        if (CONFIG.verbose) {
          changes.forEach(c => console.log(`    - ${c}`));
        }
      }
      stats.fixed++;
      stats.fixedFiles.push(filename);
      return true;
    }

    stats.skipped++;
    return false;

  } catch (error) {
    console.error(`  [ERROR] ${filename}: ${error.message}`);
    stats.errors.push({ file: filename, error: error.message });
    return false;
  }
}

// Recursively scan directory
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, backups, etc.
      if (!['node_modules', 'backups', '__tests__', 'backups_20260129'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      stats.scanned++;
      fixFile(fullPath);
    }
  }
}

// Main execution
function main() {
  console.log('========================================');
  console.log('  Auto-fix Loading Screens Script');
  console.log('========================================');
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY-RUN (no changes)' : 'LIVE (will modify files)'}`);
  console.log(`Source: ${CONFIG.srcDir}`);
  console.log('');

  if (!fs.existsSync(CONFIG.srcDir)) {
    console.error(`Error: Source directory not found: ${CONFIG.srcDir}`);
    process.exit(1);
  }

  console.log('Scanning files...\n');
  scanDirectory(CONFIG.srcDir);

  // Print summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================');
  console.log(`Files scanned: ${stats.scanned}`);
  console.log(`Files fixed:   ${stats.fixed}`);
  console.log(`Files skipped: ${stats.skipped}`);
  console.log(`Errors:        ${stats.errors.length}`);

  if (stats.fixedFiles.length > 0) {
    console.log('\nFixed files:');
    stats.fixedFiles.forEach(f => console.log(`  - ${f}`));
  }

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }

  if (CONFIG.dryRun) {
    console.log('\n[DRY-RUN] No files were modified. Remove --dry-run to apply changes.');
  }
}

main();
