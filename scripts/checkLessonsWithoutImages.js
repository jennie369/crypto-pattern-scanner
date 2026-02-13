/**
 * Check which lessons are missing images
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pgfkbcnzqozzkohwbgbk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg'
);

function hasRealImages(html) {
  if (!html) return false;
  const supabaseCount = (html.match(/supabase[^"]*\/course-images\//g) || []).length;
  return supabaseCount > 0;
}

function countPlaceholders(html) {
  if (!html) return 0;
  return (html.match(/placehold\.co/g) || []).length;
}

function countImages(html) {
  if (!html) return 0;
  return (html.match(/<img[^>]+>/g) || []).length;
}

async function check() {
  const courses = [
    { id: 'course-tier1-trading-foundation', name: 'TIER 1' },
    { id: 'course-tier2-trading-advanced', name: 'TIER 2' },
    { id: 'course-tier3-trading-mastery', name: 'TIER 3' }
  ];

  const summary = [];

  for (const course of courses) {
    console.log('\n' + '='.repeat(60));
    console.log(course.name + ' - Lessons CHƯA CÓ HÌNH ẢNH');
    console.log('='.repeat(60));

    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('id, title, html_content, module_id, order_index')
      .eq('course_id', course.id)
      .order('module_id')
      .order('order_index');

    const noImages = [];
    const withImages = [];

    for (const l of lessons || []) {
      const hasReal = hasRealImages(l.html_content);
      const placeholders = countPlaceholders(l.html_content);
      const totalImgs = countImages(l.html_content);

      if (!hasReal && totalImgs > 0) {
        noImages.push({
          id: l.id,
          title: l.title,
          module: l.module_id,
          placeholders,
          totalImgs
        });
      } else if (hasReal) {
        withImages.push(l.title);
      }
    }

    if (noImages.length === 0) {
      console.log('   ✅ Tất cả bài học đã có hình ảnh!');
    } else {
      console.log('   Cần tạo hình ảnh cho ' + noImages.length + ' bài:\n');
      noImages.forEach((l, i) => {
        console.log('   ' + (i+1) + '. ' + (l.title || '').substring(0, 55));
        console.log('      → ' + l.totalImgs + ' hình cần tạo');
      });
    }

    console.log('\n   📊 Tổng: ' + withImages.length + ' có hình / ' + noImages.length + ' chưa có');

    summary.push({
      tier: course.name,
      withImages: withImages.length,
      noImages: noImages.length,
      lessons: noImages
    });
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('TỔNG KẾT');
  console.log('='.repeat(60));

  let totalNoImages = 0;
  let totalWithImages = 0;

  for (const s of summary) {
    totalNoImages += s.noImages;
    totalWithImages += s.withImages;
    console.log(`   ${s.tier}: ${s.withImages} có hình, ${s.noImages} chưa có`);
  }

  console.log('\n   TỔNG CỘNG: ' + totalWithImages + ' có hình / ' + totalNoImages + ' chưa có');
  console.log('='.repeat(60));
}

check().catch(console.error);
