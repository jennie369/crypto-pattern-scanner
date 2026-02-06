const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

// Đọc index.html
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Tạo 200.html (Vercel legacy support)
fs.writeFileSync(path.join(distDir, '200.html'), indexHtml);

// Tạo các route files trực tiếp
const routes = [
  'courses',
  'courses/admin',
  'courses/admin/create',
  'scanner-v2',
  'admin',
  'login',
  'signup',
  'pricing',
  'shop',
  'cart',
  'forum',
  'messages',
  'events',
  'leaderboard',
  'chatbot',
  'dashboard',
  'affiliate',
  'account',
  'profile',
  'vision-board',
  'rituals',
  'scanner',
  'analytics',
  'history',
  'scan-history',
  'settings',
  'portfolio',
  'mtf-analysis',
  'sentiment',
  'news-calendar',
  'tier3/backtesting',
  'tier3/ai-prediction',
  'tier3/whale-tracker',
  'home-v2',
];

routes.forEach(route => {
  const routeDir = path.join(distDir, route);

  // Tạo folder (recursive để handle nested routes)
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  // Copy index.html vào folder
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
});

console.log('✅ Generated fallback files for', routes.length, 'routes');
console.log('Routes:', routes.join(', '));
