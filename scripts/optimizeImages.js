/**
 * GEM Academy - Optimize Images Before Upload
 * Nén + resize hình ảnh để load nhanh hơn
 *
 * TRƯỚC: 5MB mỗi hình → LOAD CHẬM
 * SAU:   200-400KB mỗi hình → LOAD NHANH
 *
 * USAGE: node scripts/optimizeImages.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_FOLDER = 'lesson-images';
const OPTIMIZED_FOLDER = 'lesson-images-optimized';

// Settings
const MAX_WIDTH = 1200;  // Max width in pixels
const QUALITY = 85;      // 1-100 (higher = better quality but larger file)
const FORMAT = 'webp';   // 'webp' (best), 'jpeg', or 'png'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

async function optimizeImage(inputPath, outputPath) {
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;

  try {
    let pipeline = sharp(inputPath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,  // Don't upscale small images
        fit: 'inside'
      });

    // Convert to chosen format
    if (FORMAT === 'webp') {
      pipeline = pipeline.webp({ quality: QUALITY });
    } else if (FORMAT === 'jpeg' || FORMAT === 'jpg') {
      pipeline = pipeline.jpeg({ quality: QUALITY });
    } else {
      pipeline = pipeline.png({ quality: QUALITY });
    }

    await pipeline.toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

    return {
      originalSize,
      newSize,
      reduction
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function processFolder(folderName) {
  const projectRoot = path.resolve(__dirname, '..');
  const inputDir = path.join(projectRoot, IMAGES_FOLDER, folderName);
  const outputDir = path.join(projectRoot, OPTIMIZED_FOLDER, folderName);

  if (!fs.existsSync(inputDir)) {
    console.log(`   ⚠️  Folder không tồn tại: ${inputDir}`);
    return { processed: 0, totalSaved: 0 };
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir)
    .filter(f => IMAGE_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)));

  if (files.length === 0) {
    console.log(`   ⚠️  Không có hình ảnh`);
    return { processed: 0, totalSaved: 0 };
  }

  console.log(`   📷 ${files.length} hình ảnh`);

  let processed = 0;
  let totalOriginal = 0;
  let totalNew = 0;

  for (const file of files) {
    const inputPath = path.join(inputDir, file);

    // Fix double extension and change to target format
    let outputName = file.replace(/\.(png|jpg|jpeg|gif)\.?(png|jpg|jpeg|gif)?$/i, `.${FORMAT}`);
    const outputPath = path.join(outputDir, outputName);

    const result = await optimizeImage(inputPath, outputPath);

    if (result) {
      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      console.log(`   ✅ ${file}`);
      console.log(`      ${formatSize(result.originalSize)} → ${formatSize(result.newSize)} (-${result.reduction}%)`);
      processed++;
    }
  }

  return {
    processed,
    totalSaved: totalOriginal - totalNew,
    totalOriginal,
    totalNew
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEM Academy - Image Optimizer');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📐 Max width: ${MAX_WIDTH}px`);
  console.log(`📦 Format: ${FORMAT.toUpperCase()}`);
  console.log(`🎨 Quality: ${QUALITY}%`);
  console.log('');

  const projectRoot = path.resolve(__dirname, '..');
  const imagesRoot = path.join(projectRoot, IMAGES_FOLDER);

  if (!fs.existsSync(imagesRoot)) {
    console.log('❌ Thư mục lesson-images/ không tồn tại');
    return;
  }

  const folders = fs.readdirSync(imagesRoot)
    .filter(f => fs.statSync(path.join(imagesRoot, f)).isDirectory());

  if (folders.length === 0) {
    console.log('⚠️  Không tìm thấy thư mục nào');
    return;
  }

  let totalProcessed = 0;
  let grandTotalOriginal = 0;
  let grandTotalNew = 0;

  for (const folder of folders) {
    console.log(`\n📁 ${folder}`);
    console.log('-'.repeat(50));

    const { processed, totalOriginal, totalNew } = await processFolder(folder);
    totalProcessed += processed;
    grandTotalOriginal += totalOriginal || 0;
    grandTotalNew += totalNew || 0;
  }

  const totalSaved = grandTotalOriginal - grandTotalNew;

  console.log('');
  console.log('='.repeat(60));
  console.log('HOÀN TẤT');
  console.log('='.repeat(60));
  console.log(`✅ Đã optimize: ${totalProcessed} hình`);
  console.log(`📦 Trước: ${formatSize(grandTotalOriginal)}`);
  console.log(`📦 Sau: ${formatSize(grandTotalNew)}`);
  console.log(`💾 Tiết kiệm: ${formatSize(totalSaved)} (${((totalSaved / grandTotalOriginal) * 100).toFixed(1)}%)`);
  console.log('');
  console.log(`📁 Hình đã optimize nằm trong: ${OPTIMIZED_FOLDER}/`);
  console.log('');
  console.log('👉 Bước tiếp theo:');
  console.log('   1. Copy hình từ lesson-images-optimized/ vào lesson-images/');
  console.log('   2. Chạy: node scripts/uploadAndUpdateImages.js');
  console.log('='.repeat(60));
}

main().catch(console.error);
