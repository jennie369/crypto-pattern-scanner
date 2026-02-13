/**
 * GEM Academy - Migrate Lessons Preserving Images
 *
 * Script này:
 * 1. BACKUP tất cả lessons từ database
 * 2. Migrate lessons giữa tiers (giữ nguyên images)
 * 3. Import chỉ những bài học MỚI (không có trong DB)
 * 4. Cập nhật chapter numbers cho lessons đã có
 *
 * KHÔNG bao giờ xóa lessons có hình ảnh!
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const COURSE_IDS = {
  tier1: 'course-tier1-trading-foundation',
  tier2: 'course-tier2-trading-advanced',
  tier3: 'course-tier3-trading-mastery'
};

/**
 * Check if lesson has real images (not placeholders)
 */
function hasRealImages(htmlContent) {
  if (!htmlContent) return false;

  // Check for Supabase storage URLs
  const supabaseImgCount = (htmlContent.match(/supabase[^"]*\/course-images\//g) || []).length;

  // Check for placehold.co (placeholders)
  const placeholderCount = (htmlContent.match(/placehold\.co/g) || []).length;

  return supabaseImgCount > 0 && supabaseImgCount > placeholderCount;
}

/**
 * Extract all image URLs from HTML content
 */
function extractImageUrls(htmlContent) {
  if (!htmlContent) return [];

  const urls = [];
  const regex = /src="(https:\/\/[^"]*supabase[^"]*\/course-images\/[^"]+)"/g;
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * Backup all lessons to local file
 */
async function backupLessons() {
  console.log('\n📦 STEP 1: Backup all lessons from database...');

  const projectRoot = path.resolve(__dirname, '..');
  const backupDir = path.join(projectRoot, 'exports', 'backup-before-migration');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backup = {};

  for (const [tierName, courseId] of Object.entries(COURSE_IDS)) {
    const { data: lessons, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      console.error(`   ❌ Error fetching ${tierName}: ${error.message}`);
      continue;
    }

    backup[tierName] = lessons;
    console.log(`   ✅ ${tierName}: ${lessons.length} lessons`);

    // Count lessons with images
    const withImages = lessons.filter(l => hasRealImages(l.html_content));
    console.log(`      → ${withImages.length} lessons có hình ảnh thật`);
  }

  const backupPath = path.join(backupDir, `backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`   💾 Saved to: ${backupPath}`);

  return backup;
}

/**
 * Analyze what needs to be done
 */
async function analyzeChanges(backup) {
  console.log('\n🔍 STEP 2: Analyzing required changes...');

  const changes = {
    keepWithImages: [], // Lessons với images - chỉ update metadata
    migrateToTier2: [], // Move from tier1 to tier2
    newLessons: [],     // Hoàn toàn mới - cần import
    updateContent: []   // Lessons cần update content
  };

  // Check TIER 1 lessons that should move to TIER 2
  // Based on plan: DPD, UPU, UPD, DPU từ TIER 1 → TIER 2
  const tier1Lessons = backup.tier1 || [];

  for (const lesson of tier1Lessons) {
    const title = lesson.title || '';
    const hasImages = hasRealImages(lesson.html_content);

    // Check if this is a pattern lesson that should be in TIER 2
    const isDPD = title.toLowerCase().includes('dpd');
    const isUPU = title.toLowerCase().includes('upu');
    const isUPD = title.toLowerCase().includes('upd');
    const isDPU = title.toLowerCase().includes('dpu');
    const isPatternLesson = isDPD || isUPU || isUPD || isDPU;

    if (isPatternLesson) {
      if (hasImages) {
        changes.keepWithImages.push({
          ...lesson,
          action: 'KEEP_IMAGES_MIGRATE_TO_TIER2',
          newCourseId: COURSE_IDS.tier2
        });
        console.log(`   🖼️  ${lesson.title.substring(0, 50)}... → MIGRATE to TIER 2 (keep images)`);
      } else {
        changes.migrateToTier2.push(lesson);
        console.log(`   📦 ${lesson.title.substring(0, 50)}... → MIGRATE to TIER 2`);
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   - Keep with images (migrate): ${changes.keepWithImages.length}`);
  console.log(`   - Migrate (no images): ${changes.migrateToTier2.length}`);
  console.log(`   - New lessons to import: TBD after scanning local files`);

  return changes;
}

/**
 * Find lessons in local files that don't exist in DB
 */
async function findNewLessons() {
  console.log('\n📁 STEP 3: Scanning local files for new lessons...');

  const projectRoot = path.resolve(__dirname, '..');
  const newLessons = [];

  // Scan tier-1 folder
  const tier1Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-1');
  const tier2Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-2');
  const tier3Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-3');

  const dirs = [
    { path: tier1Dir, tier: 1, courseId: COURSE_IDS.tier1 },
    { path: tier2Dir, tier: 2, courseId: COURSE_IDS.tier2 },
    { path: tier3Dir, tier: 3, courseId: COURSE_IDS.tier3 }
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir.path)) continue;

    const files = fs.readdirSync(dir.path).filter(f => f.endsWith('.html'));
    console.log(`   📁 tier-${dir.tier}: ${files.length} files`);

    for (const file of files) {
      // Check if lesson exists in DB by title pattern
      const match = file.match(/tier-\d-bai-(\d+)\.(\d+)-(.+)\.html/);
      if (!match) continue;

      const chapter = match[1];
      const lessonNum = match[2];
      const titlePattern = `Bài ${chapter}.${lessonNum}:%`;

      const { data } = await supabase
        .from('course_lessons')
        .select('id, title')
        .eq('course_id', dir.courseId)
        .like('title', titlePattern)
        .limit(1);

      if (!data || data.length === 0) {
        newLessons.push({
          file,
          tier: dir.tier,
          chapter: parseInt(chapter),
          lesson: parseInt(lessonNum),
          courseId: dir.courseId,
          filePath: path.join(dir.path, file)
        });
      }
    }
  }

  console.log(`   ✅ Found ${newLessons.length} new lessons to import`);
  return newLessons;
}

/**
 * Execute migration
 */
async function executeMigration(changes, newLessons, dryRun = true) {
  console.log(`\n🚀 STEP 4: ${dryRun ? 'DRY RUN' : 'EXECUTING'} migration...`);

  if (dryRun) {
    console.log('   ⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --execute to apply changes');
    console.log('');
  }

  // 1. Migrate lessons with images (change course_id, keep content)
  console.log('\n   📦 Migrating lessons with images...');
  for (const lesson of changes.keepWithImages) {
    console.log(`      ${lesson.title.substring(0, 50)}`);
    if (!dryRun) {
      // Update course_id to move to tier2
      const { error } = await supabase
        .from('course_lessons')
        .update({
          course_id: lesson.newCourseId,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id);

      if (error) {
        console.error(`         ❌ Error: ${error.message}`);
      } else {
        console.log(`         ✅ Migrated to TIER 2`);
      }
    }
  }

  // 2. Import new lessons
  console.log('\n   📝 Importing new lessons...');
  for (const newLesson of newLessons.slice(0, 5)) { // Limit to 5 for safety
    console.log(`      ${newLesson.file}`);
    if (!dryRun) {
      const htmlContent = fs.readFileSync(newLesson.filePath, 'utf-8');
      const titleMatch = htmlContent.match(/<title>([^<]+)/);
      const title = titleMatch ? titleMatch[1].trim() : newLesson.file;

      const lessonId = `lesson-tier-${newLesson.tier}-ch${newLesson.chapter}-l${newLesson.lesson}`;
      const moduleId = `module-tier-${newLesson.tier}-ch${newLesson.chapter}`;

      const { error } = await supabase
        .from('course_lessons')
        .upsert({
          id: lessonId,
          module_id: moduleId,
          course_id: newLesson.courseId,
          title: title,
          type: 'article',
          html_content: htmlContent,
          content: htmlContent,
          order_index: newLesson.lesson,
          duration_minutes: 15,
          is_preview: newLesson.lesson === 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error(`         ❌ Error: ${error.message}`);
      } else {
        console.log(`         ✅ Imported`);
      }
    }
  }

  console.log('\n✅ Migration analysis complete!');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('='.repeat(60));
  console.log('GEM Academy - Migrate Lessons (Preserve Images)');
  console.log('='.repeat(60));

  // Step 1: Backup
  const backup = await backupLessons();

  // Step 2: Analyze
  const changes = await analyzeChanges(backup);

  // Step 3: Find new lessons
  const newLessons = await findNewLessons();

  // Step 4: Execute (or dry run)
  await executeMigration(changes, newLessons, dryRun);

  console.log('\n' + '='.repeat(60));
  console.log('USAGE:');
  console.log('  node scripts/migrateLessonsPreserveImages.js           (dry run)');
  console.log('  node scripts/migrateLessonsPreserveImages.js --execute (apply changes)');
  console.log('='.repeat(60));
}

main().catch(console.error);
