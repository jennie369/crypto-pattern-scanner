const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

const BASE_DIR = path.join(__dirname, 'Khóa Trading');
const fileMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'file-map.json'), 'utf8'));

async function updateLesson(lessonId, htmlContent) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/course_lessons?id=eq.${lessonId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ html_content: htmlContent })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
  }
  return response.status;
}

async function main() {
  console.log(`Updating HTML content for ${fileMap.length} lessons...`);

  let updated = 0;
  let errors = 0;

  for (const entry of fileMap) {
    const filePath = path.join(BASE_DIR, entry.tier, entry.file);
    const htmlContent = fs.readFileSync(filePath, 'utf8');

    try {
      await updateLesson(entry.id, htmlContent);
      updated++;
      if (updated % 10 === 0 || updated === fileMap.length) {
        console.log(`  Updated ${updated}/${fileMap.length}`);
      }
    } catch (err) {
      console.error(`  ERROR: ${entry.id} (${entry.file}): ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
