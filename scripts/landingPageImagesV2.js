/**
 * GEM Landing Page - Image Replacement V2
 *
 * Tự động thêm hình vào HTML dựa trên tên file:
 * - sec01-01.jpg → section-01-*.html
 * - sec02-01.jpg → section-02-*.html
 *
 * Nếu có placeholder → thay thế
 * Nếu không có placeholder → thêm vào vị trí phù hợp
 *
 * USAGE:
 *   node scripts/landingPageImagesV2.js "Khóa Trading_landing"
 */

const fs = require('fs');
const path = require('path');

const IMAGES_FOLDER = 'landing-images';

// Regex to match image filenames: secXX-YY.jpg or secXX-YY.jpg.webp
const IMAGE_PATTERN = /^sec(\d{2})-(\d{2})(\.[a-z]+)+$/i;

// Placeholder patterns to find and replace
const PLACEHOLDER_PATTERNS = [
  /https:\/\/via\.placeholder\.com\/[^"'\s)]+/gi,
  /https:\/\/placehold\.co\/[^"'\s)]+/gi,
  /https:\/\/images\.unsplash\.com\/[^"'\s)]+/gi,
];

function getHtmlFilesInFolder(folderPath) {
  return fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.html'))
    .map(f => ({
      filename: f,
      path: path.join(folderPath, f),
      // Extract section number from filename like "section-01-hero.html"
      sectionNum: f.match(/section-(\d{2})/)?.[1] || null
    }))
    .filter(f => f.sectionNum !== null);
}

function getImagesInFolder(folderPath) {
  const imagesPath = path.join(folderPath, IMAGES_FOLDER);

  if (!fs.existsSync(imagesPath)) {
    return [];
  }

  return fs.readdirSync(imagesPath)
    .map(f => {
      const match = f.match(IMAGE_PATTERN);
      if (!match) return null;
      return {
        filename: f,
        path: path.join(imagesPath, f),
        relativePath: `${IMAGES_FOLDER}/${f}`,
        sectionNum: match[1],
        imageNum: match[2],
        sortKey: `${match[1]}-${match[2]}`
      };
    })
    .filter(f => f !== null)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function findPlaceholders(content) {
  const placeholders = [];

  for (const pattern of PLACEHOLDER_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      placeholders.push({
        url: match[0],
        index: match.index
      });
    }
  }

  // Sort by position and remove duplicates
  return [...new Set(placeholders.map(p => p.url))];
}

function createImageHtml(imagePath, imageNum) {
  return `
    <!-- Image ${imageNum} -->
    <div class="section-image" style="margin: 20px auto; text-align: center;">
      <img src="${imagePath}" alt="Section Image ${imageNum}" style="max-width: 100%; height: auto; border-radius: 8px;">
    </div>
`;
}

function findInsertPosition(content) {
  // Try to find good insertion points in order of preference:

  // 1. Before closing </section> tag
  const sectionClose = content.lastIndexOf('</section>');
  if (sectionClose > -1) return sectionClose;

  // 2. Before closing </main> tag
  const mainClose = content.lastIndexOf('</main>');
  if (mainClose > -1) return mainClose;

  // 3. Before closing </body> tag
  const bodyClose = content.lastIndexOf('</body>');
  if (bodyClose > -1) return bodyClose;

  // 4. At the end
  return content.length;
}

function processSection(htmlFile, images, folderPath) {
  let content = fs.readFileSync(htmlFile.path, 'utf-8');
  const placeholders = findPlaceholders(content);

  let replaced = 0;
  let added = 0;

  console.log(`\n📄 ${htmlFile.filename}`);
  console.log(`   Placeholders: ${placeholders.length}, Images: ${images.length}`);

  // Sort images by imageNum
  const sortedImages = images.sort((a, b) => parseInt(a.imageNum) - parseInt(b.imageNum));

  for (let i = 0; i < sortedImages.length; i++) {
    const img = sortedImages[i];

    if (i < placeholders.length) {
      // Replace placeholder
      const placeholder = placeholders[i];
      content = content.replace(placeholder, img.relativePath);
      console.log(`   ✅ Replaced placeholder ${i + 1} → ${img.filename}`);
      replaced++;
    } else {
      // No placeholder, add new image
      const insertPos = findInsertPosition(content);
      const imageHtml = createImageHtml(img.relativePath, img.imageNum);
      content = content.slice(0, insertPos) + imageHtml + content.slice(insertPos);
      console.log(`   ➕ Added new image → ${img.filename}`);
      added++;
    }
  }

  if (replaced > 0 || added > 0) {
    // Backup original
    const backupPath = htmlFile.path + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(htmlFile.path, backupPath);
    }

    // Save updated content
    fs.writeFileSync(htmlFile.path, content, 'utf-8');
    console.log(`   💾 Saved (${replaced} replaced, ${added} added)`);
  } else {
    console.log(`   ⚠️  No images to process`);
  }

  return { replaced, added };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('');
    console.log('USAGE:');
    console.log('  node scripts/landingPageImagesV2.js <folder_path>');
    console.log('');
    console.log('EXAMPLE:');
    console.log('  node scripts/landingPageImagesV2.js "Khóa Trading_landing"');
    console.log('');
    console.log('IMAGE NAMING:');
    console.log('  sec01-01.jpg  → section-01-*.html (image 1)');
    console.log('  sec01-02.jpg  → section-01-*.html (image 2)');
    console.log('  sec02-01.jpg  → section-02-*.html (image 1)');
    console.log('');
    return;
  }

  const projectRoot = path.resolve(__dirname, '..');
  let folderPath = args[0];

  if (!path.isAbsolute(folderPath)) {
    folderPath = path.join(projectRoot, folderPath);
  }

  console.log('='.repeat(60));
  console.log('GEM Landing Page - Image Replacement V2');
  console.log('='.repeat(60));
  console.log(`📁 Folder: ${folderPath}`);

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder không tồn tại: ${folderPath}`);
    return;
  }

  // Get HTML files and images
  const htmlFiles = getHtmlFilesInFolder(folderPath);
  const images = getImagesInFolder(folderPath);

  console.log(`📄 HTML files: ${htmlFiles.length}`);
  console.log(`🖼️  Images: ${images.length}`);

  if (images.length === 0) {
    console.log('');
    console.log(`⚠️  Không tìm thấy hình trong ${IMAGES_FOLDER}/`);
    console.log('');
    console.log('Đặt hình với naming: secXX-YY.jpg');
    console.log('  sec01-01.jpg, sec01-02.jpg, ...');
    console.log('  sec02-01.jpg, sec02-02.jpg, ...');
    return;
  }

  // Group images by section
  const imagesBySection = {};
  for (const img of images) {
    if (!imagesBySection[img.sectionNum]) {
      imagesBySection[img.sectionNum] = [];
    }
    imagesBySection[img.sectionNum].push(img);
  }

  console.log('');
  console.log('Images by section:');
  for (const [sec, imgs] of Object.entries(imagesBySection)) {
    console.log(`  Section ${sec}: ${imgs.map(i => i.filename).join(', ')}`);
  }

  let totalReplaced = 0;
  let totalAdded = 0;

  // Process each section
  for (const [sectionNum, sectionImages] of Object.entries(imagesBySection)) {
    const htmlFile = htmlFiles.find(f => f.sectionNum === sectionNum);

    if (!htmlFile) {
      console.log(`\n⚠️  Không tìm thấy HTML file cho section ${sectionNum}`);
      continue;
    }

    const { replaced, added } = processSection(htmlFile, sectionImages, folderPath);
    totalReplaced += replaced;
    totalAdded += added;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Replaced: ${totalReplaced} placeholders`);
  console.log(`➕ Added: ${totalAdded} new images`);
  console.log('');
  console.log('💡 Backup files đã được tạo (.backup)');
  console.log('='.repeat(60));
}

main().catch(console.error);
