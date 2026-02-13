/**
 * Script to convert Judge.me CSV reviews to JSON
 * Run: node scripts/convertReviews.js
 *
 * Creates indexed structure:
 * - byProductId: Reviews grouped by Shopify product ID
 * - byHandle: Reviews grouped by product handle
 * - stats: Global statistics
 */

const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = 'C:\\Users\\Jennie Chu\\Downloads\\yinyang-masters-all-published-reviews-in-judgeme-format-2025-11-23-1763933503.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Simple CSV parser
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }
  }

  return rows;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// Format date to Vietnamese format
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('vi-VN');
}

// Parse CSV
console.log('Reading CSV file...');
const rows = parseCSV(csvContent);
console.log(`Found ${rows.length} rows`);

// Filter and transform reviews
const reviews = rows
  .filter(row => row.curated === 'ok' && parseInt(row.rating) >= 4 && row.product_id && row.body)
  .map(row => ({
    id: row.metaobject_handle || `review-${Math.random().toString(36).substr(2, 9)}`,
    productId: row.product_id.trim(),
    productHandle: row.product_handle ? row.product_handle.trim() : '',
    title: row.title ? row.title.trim() : '',
    body: row.body.trim(),
    rating: parseInt(row.rating) || 5,
    author: row.reviewer_name ? row.reviewer_name.trim() : 'Khách hàng',
    date: formatDate(row.review_date),
    verified: true,
    images: row.picture_urls
      ? row.picture_urls.split(',').map(url => url.trim()).filter(Boolean)
      : [],
    reply: row.reply && row.reply.trim() ? row.reply.trim() : null,
    replyDate: row.reply_date ? formatDate(row.reply_date) : null,
  }));

console.log(`Filtered ${reviews.length} reviews (4+ stars, curated ok)`);

// Group by BOTH product_id AND product_handle
const byProductId = {};
const byHandle = {};

reviews.forEach(review => {
  // Index by product_id
  if (review.productId) {
    if (!byProductId[review.productId]) {
      byProductId[review.productId] = [];
    }
    byProductId[review.productId].push(review);
  }

  // Index by product_handle
  if (review.productHandle) {
    if (!byHandle[review.productHandle]) {
      byHandle[review.productHandle] = [];
    }
    byHandle[review.productHandle].push(review);
  }
});

// Calculate stats
const totalReviews = reviews.length;
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

// Create final structure
const reviewsData = {
  byProductId,
  byHandle,
  stats: {
    totalReviews,
    totalProductsById: Object.keys(byProductId).length,
    totalProductsByHandle: Object.keys(byHandle).length,
    averageRating: Math.round(avgRating * 10) / 10,
  },
};

// Save to JSON
const outputPath = path.join(__dirname, '../src/data/reviews.json');

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(reviewsData, null, 2));

console.log('\n✅ Conversion complete!');
console.log(`📊 Stats:`);
console.log(`   - Total reviews: ${totalReviews}`);
console.log(`   - Products with reviews (by ID): ${Object.keys(byProductId).length}`);
console.log(`   - Products with reviews (by handle): ${Object.keys(byHandle).length}`);
console.log(`   - Average rating: ${avgRating.toFixed(1)}`);

// Print sample products with review counts
console.log('\n📋 Sample products with review counts:');
Object.entries(byProductId)
  .slice(0, 10)
  .forEach(([id, productReviews]) => {
    const handle = productReviews[0]?.productHandle || 'N/A';
    console.log(`   Product ${id} (${handle}): ${productReviews.length} reviews`);
  });

console.log(`\n📁 Saved to: ${outputPath}`);
