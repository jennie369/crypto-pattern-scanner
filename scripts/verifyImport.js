/**
 * Verify lesson import
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  console.log('Verifying import...\n');

  // Get courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, total_lessons')
    .like('id', 'course-tier%')
    .order('id');

  console.log('📚 COURSES:');
  console.log('-'.repeat(70));
  courses?.forEach(c => {
    console.log(`   ${c.id}`);
    console.log(`   ${c.title}`);
    console.log(`   Total Lessons: ${c.total_lessons}`);
    console.log('');
  });

  // Get modules count
  const { count: moduleCount } = await supabase
    .from('course_modules')
    .select('id', { count: 'exact', head: true })
    .like('id', 'module-tier%');

  // Get lessons count
  const { count: lessonCount } = await supabase
    .from('course_lessons')
    .select('id', { count: 'exact', head: true })
    .like('id', 'lesson-tier%');

  // Get lessons with html_content
  const { count: htmlCount } = await supabase
    .from('course_lessons')
    .select('id', { count: 'exact', head: true })
    .like('id', 'lesson-tier%')
    .not('html_content', 'is', null);

  console.log('📊 SUMMARY:');
  console.log('-'.repeat(70));
  console.log(`   Modules: ${moduleCount}`);
  console.log(`   Lessons: ${lessonCount}`);
  console.log(`   Lessons with HTML: ${htmlCount}`);
  console.log('');

  // Sample lesson
  const { data: sample } = await supabase
    .from('course_lessons')
    .select('id, title, type, html_content')
    .eq('id', 'lesson-tier-1-ch3-l2')
    .single();

  if (sample) {
    console.log('📄 SAMPLE LESSON:');
    console.log('-'.repeat(70));
    console.log(`   ID: ${sample.id}`);
    console.log(`   Title: ${sample.title}`);
    console.log(`   Type: ${sample.type}`);
    console.log(`   HTML Content: ${sample.html_content ? sample.html_content.substring(0, 100) + '...' : 'NULL'}`);
  }

  console.log('\n✅ Verification complete!');
}

verify().catch(console.error);
