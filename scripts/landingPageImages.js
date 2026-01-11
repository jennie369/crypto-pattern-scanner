/**
 * GEM Landing Page - Image Replacement Tool
 *
 * WORKFLOW:
 * 1. Chạy: node scripts/landingPageImages.js scan
 *    → Tạo file image-mapping.json với tất cả placeholder URLs
 *
 * 2. Thêm hình vào thư mục: landing-images/
 *    Và cập nhật đường dẫn trong image-mapping.json
 *
 * 3. Chạy: node scripts/landingPageImages.js replace
 *    → Thay thế tất cả URLs trong HTML files
 *
 * USAGE:
 *   node scripts/landingPageImages.js scan [folder_path]
 *   node scripts/landingPageImages.js replace [folder_path]
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_LANDING_FOLDER = 'Khóa Kích Hoạt Tần Số Tình Yêu_Landing';
const MAPPING_FILE = 'image-mapping.json';
const IMAGES_FOLDER = 'landing-images';

// Regex patterns to find image URLs
const URL_PATTERNS = [
  /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi,
  /background:\s*[^;]*url\(['"]?([^'")]+)['"]?\)/gi,
  /<img[^>]+src=['"]([^'"]+)['"]/gi,
  /url\(['"]?(https?:\/\/[^'")]+)['"]?\)/gi,
];

function extractUrls(htmlContent, filename) {
  const urls = [];
  const seen = new Set();

  for (const pattern of URL_PATTERNS) {
    let match;
    // Reset regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(htmlContent)) !== null) {
      const url = match[1];

      // Skip data URLs and local references that are already set
      if (url.startsWith('data:') || url.startsWith('#')) continue;

      // Skip duplicates
      if (seen.has(url)) continue;
      seen.add(url);

      // Find line number
      const beforeMatch = htmlContent.substring(0, match.index);
      const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

      // Try to find CSS class or context
      let context = 'unknown';
      const contextMatch = htmlContent.substring(Math.max(0, match.index - 200), match.index)
        .match(/\.([a-zA-Z0-9_-]+(?:-image)?)\s*\{[^}]*$/);
      if (contextMatch) {
        context = contextMatch[1];
      }

      urls.push({
        originalUrl: url,
        newUrl: '', // User fills this in
        file: filename,
        line: lineNumber,
        context: context,
        isPlaceholder: url.includes('unsplash') || url.includes('placehold') || url.includes('placeholder')
      });
    }
  }

  return urls;
}

async function scanLandingFolder(folderPath) {
  console.log('='.repeat(60));
  console.log('SCAN - Tìm tất cả placeholder images');
  console.log('='.repeat(60));
  console.log(`📁 Folder: ${folderPath}`);
  console.log('');

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder không tồn tại: ${folderPath}`);
    return;
  }

  const htmlFiles = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.html'))
    .sort();

  if (htmlFiles.length === 0) {
    console.log('⚠️  Không tìm thấy file HTML nào');
    return;
  }

  console.log(`📄 Tìm thấy ${htmlFiles.length} file HTML`);
  console.log('');

  const allUrls = [];
  let totalPlaceholders = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const urls = extractUrls(content, file);

    const placeholders = urls.filter(u => u.isPlaceholder);
    totalPlaceholders += placeholders.length;

    if (placeholders.length > 0) {
      console.log(`📄 ${file}`);
      placeholders.forEach((u, i) => {
        console.log(`   ${i + 1}. [${u.context}] ${u.originalUrl.substring(0, 60)}...`);
      });
      console.log('');
    }

    allUrls.push(...urls);
  }

  // Create mapping structure
  const mapping = {
    _instructions: {
      vi: "Thêm đường dẫn hình mới vào 'newUrl'. Có thể dùng: URL online, hoặc tên file trong thư mục landing-images/",
      en: "Add new image URL to 'newUrl'. Can use: online URL, or filename in landing-images/ folder"
    },
    _stats: {
      totalFiles: htmlFiles.length,
      totalPlaceholders: totalPlaceholders,
      scannedAt: new Date().toISOString()
    },
    images: allUrls.filter(u => u.isPlaceholder).map((u, index) => ({
      id: index + 1,
      file: u.file,
      context: u.context,
      originalUrl: u.originalUrl,
      newUrl: `landing-images/image-${String(index + 1).padStart(2, '0')}.jpg`,
      line: u.line
    }))
  };

  // Save mapping file
  const mappingPath = path.join(folderPath, MAPPING_FILE);
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf-8');

  // Create images folder
  const imagesPath = path.join(folderPath, IMAGES_FOLDER);
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('HOÀN TẤT SCAN');
  console.log('='.repeat(60));
  console.log(`✅ Tìm thấy: ${totalPlaceholders} placeholder images`);
  console.log(`📄 Đã tạo: ${mappingPath}`);
  console.log(`📁 Đã tạo folder: ${imagesPath}`);
  console.log('');
  console.log('📋 BƯỚC TIẾP THEO:');
  console.log('');
  console.log('   1. Mở file image-mapping.json');
  console.log('   2. Thêm hình vào folder landing-images/');
  console.log('   3. Cập nhật "newUrl" trong mapping file');
  console.log('   4. Chạy: node scripts/landingPageImages.js replace');
  console.log('');
  console.log('='.repeat(60));
}

async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`   ❌ Optimize error: ${error.message}`);
    return false;
  }
}

async function replacePlaceholders(folderPath) {
  console.log('='.repeat(60));
  console.log('REPLACE - Thay thế placeholder images');
  console.log('='.repeat(60));
  console.log(`📁 Folder: ${folderPath}`);
  console.log('');

  const mappingPath = path.join(folderPath, MAPPING_FILE);

  if (!fs.existsSync(mappingPath)) {
    console.error(`❌ File mapping không tồn tại: ${mappingPath}`);
    console.log('   Chạy "scan" trước: node scripts/landingPageImages.js scan');
    return;
  }

  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  const images = mapping.images;

  if (!images || images.length === 0) {
    console.log('⚠️  Không có images trong mapping file');
    return;
  }

  // Check which images have newUrl set
  const toReplace = images.filter(img => img.newUrl && img.newUrl !== img.originalUrl);
  console.log(`📷 Có ${toReplace.length}/${images.length} hình cần thay thế`);
  console.log('');

  // Group by file
  const byFile = {};
  for (const img of toReplace) {
    if (!byFile[img.file]) byFile[img.file] = [];
    byFile[img.file].push(img);
  }

  let totalReplaced = 0;

  for (const [filename, imgs] of Object.entries(byFile)) {
    const filePath = path.join(folderPath, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File không tồn tại: ${filename}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    let fileReplaced = 0;

    console.log(`📄 ${filename}`);

    for (const img of imgs) {
      let newUrl = img.newUrl;

      // If it's a local file path, check if it exists
      if (!newUrl.startsWith('http')) {
        const localPath = path.join(folderPath, newUrl);
        if (!fs.existsSync(localPath)) {
          console.log(`   ⚠️  Hình không tồn tại: ${newUrl}`);
          continue;
        }
        // Convert to relative path for HTML
        newUrl = newUrl.replace(/\\/g, '/');
      }

      // Replace in content
      if (content.includes(img.originalUrl)) {
        content = content.split(img.originalUrl).join(newUrl);
        console.log(`   ✅ [${img.context}] → ${newUrl.substring(0, 50)}...`);
        fileReplaced++;
        totalReplaced++;
      } else {
        console.log(`   ⚠️  Không tìm thấy URL gốc: ${img.originalUrl.substring(0, 40)}...`);
      }
    }

    if (fileReplaced > 0) {
      // Backup original
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }

      // Save updated content
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`   💾 Đã lưu (${fileReplaced} thay đổi)`);
    }

    console.log('');
  }

  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Đã thay thế: ${totalReplaced} images`);
  console.log('');
  console.log('💡 Backup files đã được tạo (.backup)');
  console.log('='.repeat(60));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  const projectRoot = path.resolve(__dirname, '..');
  let folderPath = args[1] || path.join(projectRoot, DEFAULT_LANDING_FOLDER);

  // If folder path is relative, resolve it
  if (!path.isAbsolute(folderPath)) {
    folderPath = path.join(projectRoot, folderPath);
  }

  if (!command || !['scan', 'replace'].includes(command)) {
    console.log('');
    console.log('GEM Landing Page - Image Replacement Tool');
    console.log('');
    console.log('USAGE:');
    console.log('  node scripts/landingPageImages.js scan [folder_path]');
    console.log('  node scripts/landingPageImages.js replace [folder_path]');
    console.log('');
    console.log('WORKFLOW:');
    console.log('  1. scan    - Quét và tạo file image-mapping.json');
    console.log('  2. Thêm hình vào folder landing-images/');
    console.log('  3. Cập nhật newUrl trong image-mapping.json');
    console.log('  4. replace - Thay thế URLs trong HTML files');
    console.log('');
    console.log('DEFAULT FOLDER:');
    console.log(`  ${DEFAULT_LANDING_FOLDER}`);
    console.log('');
    return;
  }

  if (command === 'scan') {
    await scanLandingFolder(folderPath);
  } else if (command === 'replace') {
    await replacePlaceholders(folderPath);
  }
}

main().catch(console.error);
