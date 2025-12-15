/**
 * Optimize Tarot and I Ching card images for mobile
 * Resize to smaller dimensions and compress for faster loading
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Target dimensions for mobile
const TAROT_WIDTH = 400;  // Will maintain aspect ratio
const ICHING_WIDTH = 400;
const JPEG_QUALITY = 80;  // Good quality, smaller size

async function optimizeImage(inputPath, outputPath, width) {
  try {
    const stats = fs.statSync(inputPath);
    const sizeBefore = (stats.size / 1024).toFixed(0);

    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const sizeAfter = (newStats.size / 1024).toFixed(0);

    // Replace original with optimized
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);

    console.log(`✓ ${path.basename(inputPath)}: ${sizeBefore}KB → ${sizeAfter}KB`);
    return true;
  } catch (error) {
    console.error(`✗ ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

async function optimizeDirectory(dir, width, label) {
  console.log(`\n📦 Optimizing ${label}...`);

  if (!fs.existsSync(dir)) {
    console.log(`  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  let success = 0;
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, `_temp_${file}`);

    if (await optimizeImage(inputPath, outputPath, width)) {
      success++;
    }
  }

  console.log(`  Completed: ${success}/${files.length} files`);
}

async function main() {
  console.log('🎴 Image Optimization Script');
  console.log('============================');

  const assetsDir = path.join(__dirname, '..', 'src', 'assets');

  // Optimize Tarot cards
  await optimizeDirectory(
    path.join(assetsDir, 'tarot', 'major'),
    TAROT_WIDTH,
    'Tarot Major Arcana'
  );

  await optimizeDirectory(
    path.join(assetsDir, 'tarot', 'minor'),
    TAROT_WIDTH,
    'Tarot Minor Arcana'
  );

  // Optimize I Ching cards
  await optimizeDirectory(
    path.join(assetsDir, 'iching'),
    ICHING_WIDTH,
    'I Ching Hexagrams'
  );

  console.log('\n✅ Optimization complete!');
}

main().catch(console.error);
