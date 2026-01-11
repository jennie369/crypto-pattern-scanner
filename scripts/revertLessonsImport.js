/**
 * GEM Trading Academy - Revert/Delete Imported Lessons
 * Removes all lessons and modules that were imported
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function revert() {
  console.log('='.repeat(60));
  console.log('REVERTING IMPORTED LESSONS');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Delete all imported lessons (lesson-tier-X-chX-lX pattern)
  console.log('🗑️  Deleting lessons...');
  const { data: deletedLessons, error: lessonError } = await supabase
    .from('course_lessons')
    .delete()
    .like('id', 'lesson-tier-%')
    .select('id');

  if (lessonError) {
    console.error('   ❌ Error deleting lessons:', lessonError.message);
  } else {
    console.log(`   ✅ Deleted ${deletedLessons?.length || 0} lessons`);
  }

  // Step 2: Delete all imported modules (module-tier-X-chX pattern)
  console.log('🗑️  Deleting modules...');
  const { data: deletedModules, error: moduleError } = await supabase
    .from('course_modules')
    .delete()
    .like('id', 'module-tier-%')
    .select('id');

  if (moduleError) {
    console.error('   ❌ Error deleting modules:', moduleError.message);
  } else {
    console.log(`   ✅ Deleted ${deletedModules?.length || 0} modules`);
  }

  // Step 3: Update course total_lessons counts
  console.log('📊 Updating course counts...');

  const courseIds = [
    'course-tier1-trading-foundation',
    'course-tier2-trading-advanced',
    'course-tier3-trading-mastery'
  ];

  for (const courseId of courseIds) {
    const { count } = await supabase
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId);

    await supabase
      .from('courses')
      .update({
        total_lessons: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    console.log(`   ${courseId}: ${count || 0} lessons remaining`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ REVERT COMPLETED');
  console.log('='.repeat(60));
  console.log('');
  console.log('Các bài học đã được xóa. Bạn có thể chỉnh sửa files HTML');
  console.log('và chạy lại import khi sẵn sàng.');
}

revert().catch(console.error);
