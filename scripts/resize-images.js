/**
 * Script resize hình ảnh thành 1242 × 2688px (iPhone 14 Pro Max)
 *
 * Cách dùng:
 *   node scripts/resize-images.js <input-folder> [output-folder]
 *
 * Ví dụ:
 *   node scripts/resize-images.js ./my-images
 *   node scripts/resize-images.js ./my-images ./resized-images
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Target dimensions (iPhone 14 Pro Max screenshot size)
const TARGET_WIDTH = 1242;
const TARGET_HEIGHT = 2688;

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.bmp'];

async function resizeImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`  📷 Original: ${metadata.width}×${metadata.height}`);

    // Resize with cover fit (fills entire area, may crop)
    // Use 'contain' if you want to fit inside without cropping (will have padding)
    await image
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',      // 'cover' = fill & crop, 'contain' = fit & pad
        position: 'center', // crop from center if needed
        background: { r: 0, g: 0, b: 0, alpha: 1 } // black background for padding
      })
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(outputPath);

    console.log(`  ✅ Resized: ${TARGET_WIDTH}×${TARGET_HEIGHT}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function processFolder(inputFolder, outputFolder) {
  // Validate input folder
  if (!fs.existsSync(inputFolder)) {
    console.error(`❌ Folder không tồn tại: ${inputFolder}`);
    process.exit(1);
  }

  // Create output folder if not exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`📁 Đã tạo folder output: ${outputFolder}`);
  }

  // Get all image files
  const files = fs.readdirSync(inputFolder).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });

  if (files.length === 0) {
    console.log('⚠️ Không tìm thấy hình ảnh nào trong folder');
    return;
  }

  console.log(`\n🖼️  Tìm thấy ${files.length} hình ảnh\n`);
  console.log(`📐 Target size: ${TARGET_WIDTH} × ${TARGET_HEIGHT}px (PNG)\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const inputPath = path.join(inputFolder, file);
    const outputName = path.parse(file).name + '.png'; // Always output as PNG
    const outputPath = path.join(outputFolder, outputName);

    console.log(`📄 ${file}`);

    const result = await resizeImage(inputPath, outputPath);
    if (result) {
      success++;
    } else {
      failed++;
    }
    console.log('');
  }

  console.log('═'.repeat(50));
  console.log(`✅ Thành công: ${success}/${files.length}`);
  if (failed > 0) {
    console.log(`❌ Thất bại: ${failed}/${files.length}`);
  }
  console.log(`📁 Output: ${outputFolder}`);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        RESIZE IMAGES TO 1242 × 2688px (PNG)               ║
╚═══════════════════════════════════════════════════════════╝

Cách dùng:
  node scripts/resize-images.js <input-folder> [output-folder]

Ví dụ:
  node scripts/resize-images.js ./my-images
  node scripts/resize-images.js ./my-images ./resized-output
  node scripts/resize-images.js "C:\\Users\\Photos" "C:\\Users\\Resized"

Nếu không chỉ định output-folder, hình sẽ được lưu vào:
  <input-folder>/resized/

Hỗ trợ: JPG, PNG, WebP, GIF, TIFF, BMP
Output: PNG 1242×2688px
`);
  process.exit(0);
}

const inputFolder = path.resolve(args[0]);
const outputFolder = args[1]
  ? path.resolve(args[1])
  : path.join(inputFolder, 'resized');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║        RESIZE IMAGES TO 1242 × 2688px (PNG)               ║
╚═══════════════════════════════════════════════════════════╝
`);
console.log(`📂 Input:  ${inputFolder}`);
console.log(`📂 Output: ${outputFolder}`);

processFolder(inputFolder, outputFolder);
