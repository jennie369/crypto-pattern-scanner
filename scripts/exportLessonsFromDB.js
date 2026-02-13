/**
 * GEM Academy - Export Lessons from Database to Local HTML Files
 * Backup content từ database ra file HTML trước khi import
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Export configuration
const EXPORT_CONFIG = {
  'course-tier1-trading-foundation': {
    name: 'Tier-1-Co-ban',
    exportPath: 'exports/trading-tier1'
  },
  'course-tier2-trading-advanced': {
    name: 'Tier-2-Nang-cao',
    exportPath: 'exports/trading-tier2'
  },
  'course-tier3-trading-mastery': {
    name: 'Tier-3-Elite',
    exportPath: 'exports/trading-tier3'
  },
  'course-tu-duy-trieu-phu': {
    name: 'Tu-Duy-Trieu-Phu',
    exportPath: 'exports/trieu-phu'
  },
  'course-tan-so-tinh-yeu': {
    name: 'Tan-So-Tinh-Yeu',
    exportPath: 'exports/tinh-yeu'
  },
  'course-mjy9zwgj-bk9btb': {
    name: 'Starter-Course',
    exportPath: 'exports/starter'
  }
};

function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function exportCourse(courseId, config) {
  console.log(`\n📚 Exporting: ${config.name}`);
  console.log('-'.repeat(50));

  // Get all lessons for this course
  const { data: lessons, error } = await supabase
    .from('course_lessons')
    .select(`
      id,
      title,
      html_content,
      order_index,
      module_id,
      course_modules!inner(title, order_index)
    `)
    .eq('course_id', courseId)
    .order('module_id')
    .order('order_index');

  if (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return 0;
  }

  if (!lessons || lessons.length === 0) {
    console.log('   ⚠️  No lessons found');
    return 0;
  }

  // Create export directory
  const projectRoot = path.resolve(__dirname, '..');
  const exportDir = path.join(projectRoot, config.exportPath);

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Export each lesson
  let exported = 0;
  for (const lesson of lessons) {
    if (!lesson.html_content) {
      console.log(`   ⚠️  ${lesson.title} - No HTML content, skipping`);
      continue;
    }

    const moduleOrder = lesson.course_modules?.order_index || 0;
    const lessonOrder = lesson.order_index || 0;

    // Generate filename: ch3-l2-ten-bai-hoc.html
    const titleSlug = sanitizeFilename(lesson.title);
    const filename = `ch${moduleOrder}-l${lessonOrder}-${titleSlug}.html`;
    const filePath = path.join(exportDir, filename);

    fs.writeFileSync(filePath, lesson.html_content, 'utf-8');
    console.log(`   ✅ ${filename}`);
    exported++;
  }

  return exported;
}

async function exportSpecificChapters(courseId, chapters) {
  console.log(`\n📚 Exporting specific chapters: ${chapters.join(', ')}`);
  console.log('-'.repeat(50));

  const projectRoot = path.resolve(__dirname, '..');
  const exportDir = path.join(projectRoot, 'exports', 'specific-backup');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  let exported = 0;

  for (const chapterNum of chapters) {
    // Get lessons for this chapter/module
    const { data: lessons, error } = await supabase
      .from('course_lessons')
      .select(`
        id,
        title,
        html_content,
        order_index,
        module_id,
        course_modules!inner(title, order_index)
      `)
      .eq('course_id', courseId)
      .eq('course_modules.order_index', chapterNum)
      .order('order_index');

    if (error) {
      console.error(`   ❌ Chapter ${chapterNum} error: ${error.message}`);
      continue;
    }

    if (!lessons || lessons.length === 0) {
      console.log(`   ⚠️  Chapter ${chapterNum}: No lessons found`);
      continue;
    }

    console.log(`   📁 Chapter ${chapterNum}: ${lessons.length} lessons`);

    for (const lesson of lessons) {
      if (!lesson.html_content) continue;

      const titleSlug = sanitizeFilename(lesson.title);
      const filename = `tier1-ch${chapterNum}-l${lesson.order_index}-${titleSlug}.html`;
      const filePath = path.join(exportDir, filename);

      fs.writeFileSync(filePath, lesson.html_content, 'utf-8');
      console.log(`      ✅ ${filename}`);
      exported++;
    }
  }

  return exported;
}

async function main() {
  const args = process.argv.slice(2);

  console.log('='.repeat(60));
  console.log('GEM Academy - Export Lessons from Database');
  console.log('='.repeat(60));

  const projectRoot = path.resolve(__dirname, '..');
  let totalExported = 0;

  if (args[0] === '--all') {
    // Export all courses
    console.log('\n📦 Exporting ALL courses...');

    for (const [courseId, config] of Object.entries(EXPORT_CONFIG)) {
      const count = await exportCourse(courseId, config);
      totalExported += count;
    }
  } else if (args[0] === '--course' && args[1]) {
    // Export specific course
    const courseId = args[1];
    const config = EXPORT_CONFIG[courseId];

    if (!config) {
      console.log('\n❌ Course not found. Available courses:');
      Object.keys(EXPORT_CONFIG).forEach(id => console.log(`   - ${id}`));
      return;
    }

    totalExported = await exportCourse(courseId, config);
  } else if (args[0] === '--chapters' && args[1]) {
    // Export specific chapters from Tier 1
    const chapters = args[1].split(',').map(n => parseInt(n.trim()));
    totalExported = await exportSpecificChapters('course-tier1-trading-foundation', chapters);
  } else {
    // Default: Export all courses
    console.log('\n📦 Exporting ALL courses (default)...');
    console.log('   Tip: Use --course <id> for specific course');
    console.log('   Tip: Use --chapters 3,4 for specific chapters\n');

    for (const [courseId, config] of Object.entries(EXPORT_CONFIG)) {
      const count = await exportCourse(courseId, config);
      totalExported += count;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('EXPORT COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Total lessons exported: ${totalExported}`);
  console.log(`📁 Export location: ${path.join(projectRoot, 'exports')}`);
  console.log('');
  console.log('📋 Usage:');
  console.log('   node scripts/exportLessonsFromDB.js --all');
  console.log('   node scripts/exportLessonsFromDB.js --course course-tier1-trading-foundation');
  console.log('   node scripts/exportLessonsFromDB.js --chapters 3,4');
  console.log('='.repeat(60));
}

main().catch(console.error);
