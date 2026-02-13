/**
 * GEM Academy - Complete Migration Script V2
 *
 * WORKFLOW AN TOÀN:
 * 1. Backup tất cả lessons
 * 2. Migrate DPD/UPU/UPD/DPU từ TIER 1 → TIER 2 (giữ images)
 * 3. Import CHỈ những bài học MỚI
 * 4. Cập nhật chapter numbers
 *
 * KHÔNG XÓA BẤT CỨ GÌ CÓ HÌNH ẢNH!
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
 * Check if lesson has real images
 */
function hasRealImages(htmlContent) {
  if (!htmlContent) return false;
  const supabaseImgCount = (htmlContent.match(/supabase[^"]*\/course-images\//g) || []).length;
  return supabaseImgCount > 0;
}

/**
 * Get module ID for a chapter
 */
function getModuleId(tier, chapter) {
  return `module-tier-${tier}-ch${chapter}`;
}

/**
 * STEP 1: Backup all lessons
 */
async function backupLessons() {
  console.log('\n📦 STEP 1: Backup all lessons...');

  const projectRoot = path.resolve(__dirname, '..');
  const backupDir = path.join(projectRoot, 'exports', 'backup-migration-v2');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const backup = {};
  for (const [tierName, courseId] of Object.entries(COURSE_IDS)) {
    const { data } = await supabase.from('course_lessons').select('*').eq('course_id', courseId);
    backup[tierName] = data || [];
    const withImages = (data || []).filter(l => hasRealImages(l.html_content));
    console.log(`   ${tierName}: ${data?.length || 0} lessons (${withImages.length} có images)`);
  }

  const backupPath = path.join(backupDir, `backup-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`   💾 Saved: ${backupPath}`);
  return backup;
}

/**
 * STEP 2: Migrate pattern lessons from TIER 1 to TIER 2
 * DPD → TIER 2 Ch1, UPU → TIER 2 Ch2, UPD → TIER 2 Ch3, DPU → TIER 2 Ch4
 */
async function migratePatternLessons(backup, dryRun) {
  console.log('\n📦 STEP 2: Migrate pattern lessons (TIER 1 → TIER 2)...');

  const tier1Lessons = backup.tier1 || [];
  const migrations = [];

  // Map old chapter to new chapter in TIER 2
  const chapterMap = {
    2: 1,  // DPD: Ch2 → TIER 2 Ch1
    3: 2,  // UPU: Ch3 → TIER 2 Ch2
    4: 3,  // UPD: Ch4 → TIER 2 Ch3
    5: 4   // DPU: Ch5 → TIER 2 Ch4
  };

  for (const lesson of tier1Lessons) {
    const title = (lesson.title || '').toLowerCase();
    const isDPD = title.includes('dpd');
    const isUPU = title.includes('upu');
    const isUPD = title.includes('upd');
    const isDPU = title.includes('dpu');

    if (!isDPD && !isUPU && !isUPD && !isDPU) continue;

    // Determine old chapter from title (e.g., "Bài 2.1:" → chapter 2)
    const chMatch = lesson.title?.match(/Bài (\d+)\./);
    const oldChapter = chMatch ? parseInt(chMatch[1]) : null;
    const newChapter = oldChapter ? chapterMap[oldChapter] : null;

    if (!newChapter) continue;

    migrations.push({
      id: lesson.id,
      oldTitle: lesson.title,
      oldCourseId: lesson.course_id,
      newCourseId: COURSE_IDS.tier2,
      oldModuleId: lesson.module_id,
      newModuleId: getModuleId(2, newChapter),
      hasImages: hasRealImages(lesson.html_content)
    });
  }

  console.log(`   Found ${migrations.length} lessons to migrate`);

  for (const m of migrations) {
    const status = m.hasImages ? '🖼️ ' : '   ';
    console.log(`   ${status}${m.oldTitle?.substring(0, 50)} → TIER 2 ${m.newModuleId}`);

    if (!dryRun) {
      const { error } = await supabase
        .from('course_lessons')
        .update({
          course_id: m.newCourseId,
          module_id: m.newModuleId,
          updated_at: new Date().toISOString()
        })
        .eq('id', m.id);

      if (error) {
        console.error(`      ❌ Error: ${error.message}`);
      }
    }
  }

  return migrations.length;
}

/**
 * STEP 3: Import only NEW lessons (that don't exist in DB)
 */
async function importNewLessons(dryRun) {
  console.log('\n📝 STEP 3: Import new lessons...');

  const projectRoot = path.resolve(__dirname, '..');
  const tiers = [
    { num: 1, path: path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-1'), courseId: COURSE_IDS.tier1 },
    { num: 2, path: path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-2'), courseId: COURSE_IDS.tier2 },
    { num: 3, path: path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-3'), courseId: COURSE_IDS.tier3 }
  ];

  let imported = 0;

  for (const tier of tiers) {
    if (!fs.existsSync(tier.path)) continue;

    const files = fs.readdirSync(tier.path).filter(f => f.endsWith('.html') && f.startsWith(`tier-${tier.num}-bai-`));
    console.log(`\n   📁 TIER ${tier.num}: ${files.length} files`);

    for (const file of files) {
      const match = file.match(/tier-\d-bai-(\d+)\.(\d+)-(.+)\.html/);
      if (!match) continue;

      const chapter = parseInt(match[1]);
      const lesson = parseInt(match[2]);
      const lessonId = `lesson-tier-${tier.num}-ch${chapter}-l${lesson}`;

      // Check if lesson already exists
      const { data: existing } = await supabase
        .from('course_lessons')
        .select('id, title')
        .eq('id', lessonId)
        .single();

      if (existing) {
        // Check if existing has images
        const { data: full } = await supabase
          .from('course_lessons')
          .select('html_content')
          .eq('id', lessonId)
          .single();

        if (hasRealImages(full?.html_content)) {
          console.log(`      ⏭️  ${file} (exists with images - SKIP)`);
          continue;
        }
      }

      // Read local file
      const filePath = path.join(tier.path, file);
      const htmlContent = fs.readFileSync(filePath, 'utf-8');

      // Extract title
      const titleMatch = htmlContent.match(/<title>([^<]+)/);
      let title = titleMatch ? titleMatch[1].trim() : match[3].replace(/-/g, ' ');
      if (!title.startsWith('Bài')) {
        title = `Bài ${chapter}.${lesson}: ${title}`;
      }

      const moduleId = getModuleId(tier.num, chapter);

      console.log(`      📄 ${file}`);
      imported++;

      if (!dryRun) {
        // Ensure module exists
        await supabase.from('course_modules').upsert({
          id: moduleId,
          course_id: tier.courseId,
          title: `Chương ${chapter}`,
          order_index: chapter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        // Upsert lesson
        const { error } = await supabase.from('course_lessons').upsert({
          id: lessonId,
          module_id: moduleId,
          course_id: tier.courseId,
          title: title,
          type: 'article',
          html_content: htmlContent,
          content: htmlContent,
          order_index: lesson,
          duration_minutes: 15,
          is_preview: lesson === 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (error) {
          console.error(`         ❌ ${error.message}`);
        }
      }
    }
  }

  console.log(`\n   ✅ ${imported} lessons to import`);
  return imported;
}

/**
 * STEP 4: Update course total_lessons
 */
async function updateCourseTotals(dryRun) {
  console.log('\n📊 STEP 4: Update course totals...');

  for (const [tierName, courseId] of Object.entries(COURSE_IDS)) {
    const { count } = await supabase
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId);

    console.log(`   ${tierName}: ${count} lessons`);

    if (!dryRun) {
      await supabase.from('courses').update({
        total_lessons: count,
        updated_at: new Date().toISOString()
      }).eq('id', courseId);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('='.repeat(60));
  console.log('GEM Academy - Complete Migration V2');
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --execute to apply changes\n');
  }

  // Step 1: Backup
  const backup = await backupLessons();

  // Step 2: Migrate patterns
  await migratePatternLessons(backup, dryRun);

  // Step 3: Import new
  await importNewLessons(dryRun);

  // Step 4: Update totals
  await updateCourseTotals(dryRun);

  console.log('\n' + '='.repeat(60));
  console.log(dryRun ? 'DRY RUN COMPLETE - Run with --execute to apply' : 'MIGRATION COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
